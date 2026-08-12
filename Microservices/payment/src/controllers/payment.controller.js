const paymentModel = require('../models/payment.model');
const axios = require('axios')

require('dotenv').config();
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function createPayment(req, res) {

    const token = req.cookies?.token || req.headers?.authorization?.split(' ')[ 1 ]

    try {
        
        const orderId = req.params.orderId;

        const orderResponse = await axios.get(`http://localhost:3003/api/orders/` + orderId, {
            headers: {
                Authorization: `Bearer ${token}`
            }    
        })
        
        const price = orderResponse.data.order.totalPrice

        // const payment = new paymentModel.create({

        // })

    } catch (err) {
        console.log(err)
       return res.status(500).json({ message: 'Internal Server Error' });
    }
}


module.exports = {createPayment};