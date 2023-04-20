const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

let Products = require('./schemas/product_model');
let Cart = require('./schemas/cart_model');
let User = require('./schemas/user_model');

const { MongoClient, ServerApiVersion } = require('mongodb');
 mongoose.connect('mongodb://127.0.0.1:27017/ecom', { useNewUrlParser: true });
const connection = mongoose.connection;
connection.once('open', function () {
    console.log("MongoDB database connection established successfully");
})

const secretKey = 'Your_secret_key';


app.post('/signup', (req, res) => {
    const { username, password } = req.body;

    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            res.status(500).send('Internal Server Error');
        } else {
            // Create a new user with the provided username and hashed password
            console.log(hash);
            const user = new User({ username: username, password: hash });
            // Save the user in your database
            user.save()
                .then(() => {
                    // Generate a JWT token with a payload containing the user's ID
                    const token = jwt.sign({ userId: password }, secretKey);
                    // Return the JWT token as a response
                    res.json({ token: token });
                })
                .catch((err) => {
                    res.status(500).send('Internal Server Error');
                });
        }
    });

    //// Check if the user's login credentials are valid
    //    // Generate a JWT token with a payload containing the user's ID
    //    const token = jwt.sign({ userId: password }, secretKey);
    //    // Return the JWT token as a response
    //    res.json({ token: token });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Find the user with the provided username in your database
    User.findOne({ username: username })
        .then(user => {
            if (!user) {
                res.status(401).send('Invalid Credentials');
            } else {
                // Compare the provided password with the user's password in the database
                bcrypt.compare(password, user.password, (err, result) => {
                    if (err) {
                        res.status(500).send('Internal Server Error');
                    } else if (!result) {
                        res.status(401).send('Invalid Credentials');
                    } else {
                        // Generate a JWT token with a payload containing the user's ID
                        console.log("valid user");
                        const token = jwt.sign({ userId: password }, secretKey);
                        // Return the JWT token as a response
                        res.json({ token: token });
                    }
                });
            }
        })
        .catch(err => {
            res.status(500).send('Internal Server Error');
        });
});



app.post('/product/user', async (req, res) => {
    const { username, products } = req.body;
    try {
        const existingUser = await Cart.findOne({ username });
        if (existingUser) {
            existingUser.products.push(products);
            const updateduser = await existingUser.save();
            res.json(updateduser);
        }
        else {
            const newUser = new Cart({ username, products });
            const saveduser = await newUser.save();
            res.json(saveduser);
        }
    } catch (err) {
        console.error("Error adding new product in cart failed:", err);
        res.status(400).send('Adding new product in cart failed');
    }
})

app.delete('/product/user/delete', async (req, res) => {
    const { username, product_name } = req.body;
    try {
        const existingUser = await Cart.findOne({ username });
        if (existingUser) {
            const index = existingUser.products.findIndex(product => product.product_name === product_name);
            if (index !== -1) {
                existingUser.products.splice(index, 1);
                const updatedUser = await existingUser.save();
                res.json(updatedUser);
            } else {
                res.status(404).send('Product not found in cart');
            }
        } else {
            res.status(404).send('User not found');
        }
    } catch (err) {
        console.error("Error deleting product from cart:", err);
        res.status(400).send('Deleting product from cart failed');
    }
})


app.post('/product_add', async (req, res) => {
    const { product_name, product_description, category } = req.body;
    try {
        const newProd = new Products({ product_name, product_description, category });
        const savedProd = await newProd.save();
        res.json(savedProd);
        console.log(savedProd);
    } catch (err) {
        console.error("Error adding new product failed:", err);
        res.status(400).send('Adding new product failed');
    }
});

app.get('/get/products', async (req, res) => {

    try {
        const items = await Products.find();
        res.json(items);
    } catch (err) {
        console.error('Error fetching availability from MongoDB:', error);
        res.status(500).json({ error: 'Failed to fetch availability' });
    }

})

app.get('/users', async (req, res) => {

    try {
        const items = await User.find();
        res.json(items);
    } catch (err) {
        console.error('Error fetching availability from MongoDB:', error);
        res.status(500).json({ error: 'Failed to fetch availability' });
    }

})

app.get('/cart/user/:Id', async (req, res) => {

    const userId = req.params.Id;
    try {

        const cart = await Cart.findOne({ username: userId });
        res.json(cart.products)

    } catch (err) {
        console.error('Error fetching availability from MongoDB:', error);
        res.status(500).json({ error: 'Failed to fetch availability' });
    }

})

const port = 4000; // Use the port number from environment variable or fallback
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
