const { subscribeToQueue } = require('../broker/broker');
const userModel = require('../models/user.model')
const productModel = require("../models/payment.model");
const orderModel = require('../models/order.model');
const paymentModel = require('../models/payment.model')

module.exports = async function () {

    subscribeToQueue("AUTH_SELLER_DASHBOARD.USER_CREATED", async (user) => {
        await userModel.create(user)
    })
    

    subscribeToQueue("PRODUCT_SELLER_DASHBOARD.USER_CREATED", async (product) => {
        await productModel.create(product)
    })


    subscribeToQueue('ORDER_SELLER_DASHBOARD.ORDER_CREATED', async (order) => {
        await orderModel.create(order)
    })

    subscribeToQueue('PAYMENT_SELLER_DASHBOARD.PAYMENT_CREATED', async (order) => {
        await orderModel.create(order)
    })

    subscribeToQueue('PAYMENT_SELLER_DASHBOARD.PAYMENT_UPDATE', async (order) => {
        await orderModel.findOneAndUpdate({ orderid: payment.orderId})
    })
}