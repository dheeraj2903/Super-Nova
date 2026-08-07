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

        // console.log("Cart response:", cartResponse.data.cart.items);

        const products = await Promise.all(cartResponse.data.cart.items.map(async (item) => {
            return (await axios.get(`http://localhost:3001/api/products/${item.productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })).data.product
        }))

        console.log("Products fetched:", products)

        let priceAmount = 0;

        const orderItems = cartResponse.data.cart.item.map((item, index) => {

            const product = product.find(p => p._id === item.productId)

            //if not in stock, does not allow order creation

            if (!product.inStock || product.inStock < item.quantity) {
                throw new Error(`Product ${product.name} is out of stock or insufficient stock`)
            }

            const itemTotal = product.price.amount * item.quatity;
            priceAmount += itemTotal;

            return {
                product: item.productId,
                quantity: item.quantity,
                price: {
                    amount: itemTotal,
                    currency: product.price.currency
                }
            }
        })

    } catch (err) {
        console.error("Error fetching cart:", err.message)
        return res.status(500).json({ message: "Internal server error", error: err.message});
    }
}

module.exports = {
    createOrder
}