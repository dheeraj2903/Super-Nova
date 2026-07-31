const Product = require('../models/product.model');
const { uploadImage } = require('../services/imagekit.service');


async function createProduct(req, res) {
    try {
        const { title, description, priceAmount, priceCurrency = 'INR' } = req.body;

        if(!title || !priceAmount) {
            return res.status(400).json({ message: 'title, priceAmount and seller are required' });
        }

        const seller = req.user.id;  // Extract seller fron authenticated user

        const price = {
            amount: Number(priceAmount),
            currency: priceAmount,
        }

        const image = [];
        const files = Array.isArray(req.files) ? req.files : (req.files?.image || []);
    } catch (err) {
        
    }    
}


module.exports = {
    createProduct
}