const cartModel = require("../models/cart.model")

async function getCart (req, res) {

    try {
        const user = req.user;
    
        let cart = await cartModel.findOne({ user: user.id });
    
        if (!cart) {
            cart = new cartModel({ user: user.id, items: [] })
            await cart.save();
        }
    
        res.status(200).json({
            cart,
            totals: {
                itemCount: cart.items.length,
                totalQuantity: cart.items.reduce((sum, item) => sum + item.quantity, 0)
            }
        })
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message:"Internal server error"
        })
    }
}

async function addItemToCart (req, res) {

   try {
     const { productId, qty } = req.body;
 
     const user = req.user;
 
     let cart = await cartModel.findOne({ user: user.id });
 
     if (!cart) {
         cart = new cartModel({ user: user.id, items: [] });
     }
 
     const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
 
     if(existingItemIndex >= 0) {
         cart.items[ existingItemIndex ].quantity += qty;
     }else {
         cart.items.push({ productId, quantity: qty });
     }
 
     await cart.save();
 
     res.status(200).json({
         message: 'Item added to cart',
         cart
     })
   } catch (err) {
    console.error(err);

        return res.status(500).json({
            message: "Internal server error"
        });
   }
};

async function updateItemQuantity (req, res) {

    try {
        
        const { productId } = req.params;
        const { qty } = req.body;

        const user = req.user;

        const cart = await cartModel.findOne({
            user: user.id
        });

        if(!cart) {
            return res.status(404).json({
                message: 'Cart not found'
            });
        }

        const item = cart.items.find(
            item => item.productId.toString() === productId
        );

        if(!item) {
            return res.status(404).json({
                message: 'Product not found in cart'
            });
        }

        item.quantity = qty;

        await cart.save();

        return res.status(200).json({
            message: 'Cart updated',
            cart
        });

    } catch (err) {
        console.error(err)
        return res.status(500).json({
            message: 'Internal server error'
        })
    }
}


module.exports = {
    addItemToCart,
    updateItemQuantity,
    getCart
}