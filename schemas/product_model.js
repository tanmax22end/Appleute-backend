const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Products = new Schema({
    product_name: {
        type: String
    },
    product_description: {
        type: String
    },
    category: {
        type: String
    }
});

module.exports = mongoose.model('Products', Products);