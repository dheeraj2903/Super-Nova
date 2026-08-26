const userModel = require('../models/user.model');
const orderModel = require('../models/order.model');
const productModel = require('../models/product.model');
const paymentModel = require('../models/payment.model');


async function getMetrics(req, res) {
    try {
        const seller = req.user;

        //Get all products for this seller
        const products = await productModel.find({ seller: seller })
        const productIds = products.map(p => p._id);

        //Get all orders containig seller's products
        const orders = await orderModel.find({
            'items.product': { $in: productIds },
            status: { $in: [ "CONFIRMED", "SHIPPED", "DELIVERED" ]}
        })

        // Sales: total number of items sold
        let sales = 0  
        let revenue = 0;
        const productSales = {};

        orders.forEach(order => {
            order.items.forEach(item => {
                if (productIds.includes(item.product)) {
                    sales += item.quantity;
                    revenue += item.price.amount * item.quantity;
                    productSales[ item.product ] = (productSales[
                        
                    ])
                }
            })
        })

    } catch (error) {
        
    }
}