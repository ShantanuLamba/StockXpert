const mongoose = require('mongoose');


const position_schema = new mongoose.Schema({
    stock_name: {
        type: String,
        required: true
    },
    stock_quantity: {
        type: Number,
        required: true
    },
    avg_price: {
        type: Number,
        required: true
    },
    last_price: {
        type: Number,
        required: true
    },
    stock_total: {
        type: Number,
        required: true
    },
    user_id: {
        type: String,
        required: true
    }
});

const Stock = new mongoose.model('stock_positions', position_schema);

module.exports = Stock;