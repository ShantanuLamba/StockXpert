const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const connectDB = require('./config/db');
const Register = require('./models/registers');
const Stock = require('./models/stock_positions');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const auth = require('./middleware/auth');
const jwt = require('jsonwebtoken');
const getStockPrice = require('./stock_price');
const e = require('express');


//connectDB();

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set View's
app.set('views', './templates/views');
app.set('view engine', 'ejs');

//console.log(process.env.SECRET_KEY);


app.get('/', (req, res) => {
  res.render('index');
});


//user registration
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  try {
    await connectDB();
    const registerUser = new Register({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password, 
        token_balance: 10000
        
    });
    //console.log(await req.body.username);

    const token = await registerUser.generateAuthToken();

    res.cookie("jwt", token, {expires: new Date(Date.now() + 3000000), httpOnly: true});

    const registered = await registerUser.save();
    res.status(201).render("index");

    
  } catch (error) {
    res.status(400).send(error);
  }
});




//user login 
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  try{
    const email = req.body.email;
    const password = req.body.password;

    await connectDB();
    const userEmail = await Register.findOne({email:email});  
    //res.send(userEmail);

    const isMatch = await bcrypt.compare(password, userEmail.password);


    if (isMatch) {
      const token = await userEmail.generateAuthToken();
      res.cookie("jwt", token, {expires: new Date(Date.now() + 3000000), httpOnly: true});
      res.status(201).redirect("/app");
    }else{
      res.send("Invalid Login Details");
    }

  } catch (error) {
    res.status(400).send("Invalid Login Details  "+error);    
  }

});


//user logout 
app.get('/logout', auth, async (req, res) => {  
  try {
    //console.log(req.user);
    req.user.tokens = [];

    res.clearCookie("jwt");
    //console.log("Logout Successfully");
    await req.user.save();
    res.render('index');
    
  } catch (error) {
    res.status(500).send(error);
  }
});


//main app page (protected)
app.get('/app', auth ,(req, res) => {
  //console.log(`Hello ${req.user.username}`);
  res.render('main_app', { username: req.user.username, token_balance: req.user.token_balance});
});



//stock trading page 
app.get('/trade/:symbol',auth ,(req, res) => {
  const stockSymbol = req.params.symbol;
  const username = req.user.username;
  const token_balance = req.user.token_balance;
  
  res.render('trading_page', { stockSymbol, username,token_balance });

});

//open positions page 
app.get('/positions', auth, async (req, res) => {  
  const user = req.user;
  await connectDB();

  // Fetch all stock positions for the logged-in user
  let userPositions = await Stock.find({ user_id: user._id.toString() });

  const positionsWithPrices = await Promise.all(userPositions.map(async (position) => {
    const price = await getStockPrice(position.stock_name.toString());
    return { ...position._doc, currentPrice: price };
  }));
  

  // Send the fetched positions to the EJS file
  res.render('open_positions', { 
    username: req.user.username,
    positions: positionsWithPrices,
    // Pass the positions to the EJS template
  });
});

//handle buy order 
app.post('/buy/:symbol', auth, async (req, res) => {
  const stock = req.params.symbol;
  const quantity = parseInt(req.body.quantity, 10); // Ensure quantity is an integer
  const user = req.user;
  let userBalance = user.token_balance; // Use let to allow modification
  const stockPrice = getStockPrice(stock.toString());
  console.log(await stockPrice);
  const totalCost = await stockPrice * quantity;

  await connectDB();

  if (userBalance < totalCost) {
    return res.send('Insufficient balance.');
  }

  // Deduct the total cost from the user's balance
  userBalance -= totalCost;
  // Update the user's balance in the database
  // Assuming there's a method to update the user, adjust as per your actual user model
  await Register.findByIdAndUpdate(user._id, { token_balance: userBalance });

  // Attempt to find an existing stock position for this user and symbol
  let existingStock = await Stock.findOne({ stock_name: stock, user_id: user._id.toString() });

  if (existingStock) {
    // Update existing stock position
    existingStock.last_price = await stockPrice;
    existingStock.avg_price = (existingStock.avg_price * existingStock.stock_quantity + await stockPrice * quantity) / (existingStock.stock_quantity + quantity);
    existingStock.stock_total += quantity; // Update quantity
    await existingStock.save();
    res.send('Stock position updated.');
  } else {
    // Create a new stock position
    const buyOrder = new Stock({
      stock_name: stock,
      stock_quantity: quantity,
      last_price: await stockPrice,
      avg_price: await stockPrice,
      stock_total: quantity, // Assuming this is meant to be the initial quantity
      user_id: user._id.toString()
    });

    await buyOrder.save();
    res.send('New stock position created.');
  }
});


//handle sell order
app.post('/sell', auth, async (req, res) => {
  const positionId = req.body.positionId;
  const SellAmount = parseInt(req.body.amount, 10); // Ensure SellAmount is an integer
  const user = req.user;
  let UserBalance = user.token_balance;

  let existingStock = await Stock.findOne({ _id: positionId });
  var stockPrice = getStockPrice(existingStock.stock_name.toString()); 

  if (!existingStock) {
    return res.send('Stock position not found.');
  }

  if (existingStock.stock_total < SellAmount) {
    return res.send('Insufficient stock quantity.');
  }

  var totalSaleValue = SellAmount * await  stockPrice;
  UserBalance += totalSaleValue;
  await Register.findByIdAndUpdate(user._id, { token_balance: UserBalance });

  existingStock.stock_total -= SellAmount;

  // Check if stock_total is zero after sale
  if (existingStock.stock_total === 0) {
    // Delete the position
    await Stock.findByIdAndDelete(positionId);
    res.send('Stock position sold and deleted. Sale value: ' + totalSaleValue);
  } else {
    // Update the position
    await existingStock.save();
    res.send('Stock position updated. Sale value: ' + totalSaleValue);
  }
});


// listen to the server
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});