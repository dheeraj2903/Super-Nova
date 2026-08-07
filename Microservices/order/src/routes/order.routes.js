const express = require('express');
const createAuthMiddleware = require('../middlewares/auth.middleware')
const orderController = require("../controllers/order.controller");


const router = express.Router();


router.post('/', createAuthMiddleware([ 'user' ]), orderController.createOrder);


module.exports = router;