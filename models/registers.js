
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const user_schema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    token_balance:{
        type: Number,   
        require: false,
    },
    tokens:[{
        token: {
            type: String,
            required: true
        }
    }]
});

//generating tokens
user_schema.methods.generateAuthToken = async function(){
    try{
        let token = jwt.sign({_id: this._id.toString()}, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token: token});
        await this.save();
        return token;
    }catch(error){
        console.log(error);
    }
}


//password hashing
user_schema.pre('save', async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 4);
    }
    next();
});

const Register = new mongoose.model('users', user_schema);

module.exports = Register;