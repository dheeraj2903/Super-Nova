const express = require("express");
const cookieParser = require("cookie-parser")
const productRoute = require("../src/routes/product.routes")


const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api/products", productRoute);


module.exports= app;