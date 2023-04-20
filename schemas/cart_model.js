const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Cart = new Schema({
    username : {
        type: String
    },
    products: [{
        product_name: {
            type: String
        },
        product_description: {
            type: String
        },
        category: {
            type: String
        }
    }]
});

module.exports = mongoose.model('Cart', Cart);