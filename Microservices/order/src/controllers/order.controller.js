const orderModel = require('../models/order.model');
const axios = require('axios');

async function createOrder(req, res) {

    const user = req.user;
    const token = req.cookies?.token || req.headers?.authorization?.split(' ')[ 1 ];

    try {
        
        // Fetch user cart from cart service
        const cartResponse = await axios.get(`http://localhost:3002/api/cart`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        console.log("Cart response:", cartResponse.data);

    } catch (err) {
        return res.status(500).json({ message: "Internal server error", error: err.message});
    }
}


module.exports = {
    createOrder
}