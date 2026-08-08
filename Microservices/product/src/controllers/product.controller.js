const { default: mongoose } = require("mongoose");
const productModel = require("../models/product.model");
const { uploadImage } = require("../services/imagekit.service");

async function createProduct(req, res) {
  try {
    const { title, description, priceAmount, priceCurrency = "INR" } = req.body;

    if (!title || !priceAmount) {
      return res
        .status(400)
        .json({ message: "title, priceAmount and seller are required" });
    }

    const seller = req.user.id; // Extract seller fron authenticated user

    const price = {
      amount: Number(priceAmount),
      currency: priceCurrency,
    };

    const images = await Promise.all(
      (req.files || []).map((file) => uploadImage({ buffer: file.buffer })),
    );

    const product = await productModel.create({
      title,
      description,
      price,
      seller,
      images,
    });
    return res.status(201).json({
      message: "Product created",
      data: product,
    });
  } catch (err) {
    console.error("Create product error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function getProducts(req, res) {
  try {
    const { q, minprice, maxprice, skip = 0, limit = 20 } = req.query;

    const filter = {};

    if (q) {
      filter.$text = { search: q };
    }

    if (minprice) {
      filter["price.amount"] = {
        ...filter["price.amount"],
        $gte: Number(minprice),
      };
    }

    if (maxprice) {
      filter["price.amount"] = {
        ...filter["price.amount"],
        $lte: Number(maxprice),
      };
    }

    const products = await productModel
      .find(filter)
      .skip(Number(skip))
      .limit(Math.min(Number(limit), 20));

    return res.status(200).json({ data: products });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

async function getProductById(req, res) {
  try {
    const { id } = req.params;

    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ product: product });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

async function updateProduct(req, res) {

    try {
        const { id } = req.params;
    
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid product id"
            });
        }
    
        // const product = await productModel.findOne({
        //     _id: id,
        //     seller: req.user.id
        // });
    
        const product = await productModel.findOne({
            _id: id,
        });
    
        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }
    
        if (product.seller.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You can only update your own product'})
        }
    
        const allowedUpdates = ["title", "description", "price"];
    
        for (const key of Object.keys(req.body)) {
    
            if (!allowedUpdates.includes(key)) {
                continue;
            }
    
            if (key === "price" && typeof req.body.price === "object") {
    
                if (req.body.price.amount !== undefined) {
                    product.price.amount = Number(req.body.price.amount);
                }
    
                if (req.body.price.currency !== undefined) {
                    product.price.currency = req.body.price.currency;
                }
    
            } else {
    
                product[key] = req.body[key];
    
            }
        }
    
        await product.save();
    
        return res.status(200).json({
            message: "Product updated",
            product
        });
    } catch (err) {
        console.error("Update Product ERROR:", err);

        return res.status(500).json({
            message: "Interval server error"
        });
    }
}

async function deleteProduct (req, res) {

    try {
        const { id } = req.params;
    
        if(!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid product id'})
        }
    
        const product = await productModel.findOne({
            _id:id
        })
    
        if (!product) {
            return res.status(404).json({ message: 'Product not found'});
        }
    
        if (product.seller.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You can only delte your own products'})
        }
    
        await productModel.findOneAndDelete({ _id: id });
        return res.status(200).json({ message: 'Product deleted'});
    } catch (err) {
        console.error(err)
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}

async function getProductBySeller (req, res) {

    try {
        const seller = req.user;
    
        const { skip = 0, limit = 20 } = req.query
    
        const products = await productModel.find({ seller: seller.id }).skip(skip).limit(Math.min(limit, 20));
    
        return res.status(200).json({ data: products})
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error"})
    }
}

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductBySeller
}
