const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const app = require("../src/app");
const Cart = require("../src/models/cart.model");

jest.mock("../src/models/cart.model");
jest.mock("jsonwebtoken");

describe("PATCH /api/cart/items/:productId", () => {

    beforeEach(() => {

        jest.clearAllMocks();

        jwt.verify.mockReturnValue({
            _id: "user123",
            role: "user"
        });

    });

    test("should update quantity", async () => {

        const productId = new mongoose.Types.ObjectId().toString();

        const cart = {
            items: [
                {
                    productId: {
                        toString: () => productId
                    },
                    quantity: 2
                }
            ],
            save: jest.fn().mockResolvedValue(true)
        };

        Cart.findOne.mockResolvedValue(cart);

        const res = await request(app)
            .patch(`/api/cart/items/${productId}`)
            .set("Authorization", "Bearer token")
            .send({
                qty: 10
            });

        expect(res.statusCode).toBe(200);

        expect(cart.items[0].quantity).toBe(10);

        expect(cart.save).toHaveBeenCalled();

    });

    test("should return 404 when cart not found", async () => {

        Cart.findOne.mockResolvedValue(null);

        const productId = new mongoose.Types.ObjectId().toString();

        const res = await request(app)
            .patch(`/api/cart/items/${productId}`)
            .set("Authorization", "Bearer token")
            .send({
                qty: 5
            });

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Cart not found");

    });

    test("should return 404 when item not found", async () => {

        Cart.findOne.mockResolvedValue({
            items: []
        });

        const productId = new mongoose.Types.ObjectId().toString();

        const res = await request(app)
            .patch(`/api/cart/items/${productId}`)
            .set("Authorization", "Bearer token")
            .send({
                qty: 5
            });

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Product not found in cart");

    });

    test("should return 400 for invalid product id", async () => {

        const res = await request(app)
            .patch("/api/cart/items/abc")
            .set("Authorization", "Bearer token")
            .send({
                qty: 5
            });

        expect(res.statusCode).toBe(400);

    });

    test("should return 400 for invalid quantity", async () => {

        const productId = new mongoose.Types.ObjectId().toString();

        const res = await request(app)
            .patch(`/api/cart/items/${productId}`)
            .set("Authorization", "Bearer token")
            .send({
                qty: 0
            });

        expect(res.statusCode).toBe(400);

    });

    test("should return 401 when token missing", async () => {

        const productId = new mongoose.Types.ObjectId().toString();

        const res = await request(app)
            .patch(`/api/cart/items/${productId}`)
            .send({
                qty: 5
            });

        expect(res.statusCode).toBe(401);

    });

    test("should return 403 when role is invalid", async () => {

        jwt.verify.mockReturnValue({
            _id: "seller123",
            role: "seller"
        });

        const productId = new mongoose.Types.ObjectId().toString();

        const res = await request(app)
            .patch(`/api/cart/items/${productId}`)
            .set("Authorization", "Bearer token")
            .send({
                qty: 5
            });

        expect(res.statusCode).toBe(403);

    });

    test("should return 500 when database throws error", async () => {

        Cart.findOne.mockRejectedValue(new Error("DB Error"));

        const productId = new mongoose.Types.ObjectId().toString();

        const res = await request(app)
            .patch(`/api/cart/items/${productId}`)
            .set("Authorization", "Bearer token")
            .send({
                qty: 5
            });

        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe("Internal server error");

    });

});