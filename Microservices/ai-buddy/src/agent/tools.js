const { tool  } = require("@langchain/core/tools")
const { z } = require('zod');
const axios = require('axios');


const searchProduct = tool(async ({ query, token }) => {
    try {
        const response = await axios.get(
            `http://localhost:3001/api/products?q=${query}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return JSON.stringify(response.data);

    } catch (err) {
        console.log("PRODUCT API ERROR:", err.response?.data);
        console.log("STATUS:", err.response?.status);
        console.log("URL:", err.config?.url);

        throw err;
    }
}, {
    name: 'searchProduct',
    description: 'Search for products based on query',
    schema: z.object({
        query: z.string()
    })
});


 const addProductToCart = tool(async ({ productId, qty=1,  token }) => {

    const response = await axios.post(`http://localhost:3002/api/cart/items`, {
        productId,
        qty
    }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    return `Added product with id ${productId} (qty: ${qty}) to cart`

 }, {
    name: 'addProductToCart',
    description: 'Add a product to the shopping cart',
    schema: z.object({
        productId: z.string().describe('The id of the product to add to the cart'),
        qty: z.number().describe('The quantity of the produt to add to the cart').default(1)
    })
 })


 module.exports = {
    searchProduct,
    addProductToCart
 }