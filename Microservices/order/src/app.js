const express = require('express');
const cookieParser = require('cookie-parser');
const orderRouter = require('../src/routes/order.routes')

const app = express();

app.use(express.json())
app.use(cookieParser());
app.use('/api/orders', orderRouter)

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Order service is running'
    })
})

module.exports = app;