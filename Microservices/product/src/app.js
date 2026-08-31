const express = require("express");
const cookieParser = require("cookie-parser")
const productRoute = require("../src/routes/product.routes")


const app = express();
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Product service is running'
    })
})

app.use("/api/products", productRoute);


module.exports= app;