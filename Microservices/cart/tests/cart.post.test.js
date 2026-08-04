const request = require("supertest");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const app = require("../src/app");
const Cart = require("../src/models/cart.model");

jest.mock("../src/models/cart.model");
jest.mock("jsonwebtoken");

describe("POST /api/cart/items", () => {

    beforeEach(() => {
        jest.clearAllMocks();

        jwt.verify.mockReturnValue({
            id: "user123",
            role: "user",
        });
    });

    test("should create new cart and add item", async () => {

        Cart.findOne.mockResolvedValue(null);

        const save = jest.fn().mockResolvedValue(true);

        Cart.mockImplementation(function () {
            return {
                user: "user123",
                items: [],
                save,
            };
        });

        const productId = new mongoose.Types.ObjectId().toString();

        const res = await request(app)
            .post("/api/cart/items")
            .set("Authorization", "Bearer token")
            .send({
                productId,
                qty: 2,
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe("Item added to cart");
        expect(save).toHaveBeenCalled();
    });

    test("should increase quantity when product already exists", async () => {

        const productId = new mongoose.Types.ObjectId().toString();

        const cart = {
            items: [
                {
                    productId: {
                        toString: () => productId,
                    },
                    quantity: 2,
                },
            ],
            save: jest.fn().mockResolvedValue(true),
        };

        Cart.findOne.mockResolvedValue(cart);

        const res = await request(app)
            .post("/api/cart/items")
            .set("Authorization", "Bearer token")
            .send({
                productId,
                qty: 3,
            });

        expect(res.statusCode).toBe(200);
        expect(cart.items[0].quantity).toBe(5);
        expect(cart.save).toHaveBeenCalled();
    });

    test("should add new item to existing cart", async () => {

        const oldId = new mongoose.Types.ObjectId().toString();
        const newId = new mongoose.Types.ObjectId().toString();

        const cart = {
            items: [
                {
                    productId: {
                        toString: () => oldId,
                    },
                    quantity: 1,
                },
            ],
            save: jest.fn().mockResolvedValue(true),
        };

        Cart.findOne.mockResolvedValue(cart);

        const res = await request(app)
            .post("/api/cart/items")
            .set("Authorization", "Bearer token")
            .send({
                productId: newId,
                qty: 4,
            });

        expect(res.statusCode).toBe(200);

        expect(cart.items.length).toBe(2);
        expect(cart.items[1]).toEqual({
            productId: newId,
            quantity: 4,
        });

        expect(cart.save).toHaveBeenCalled();
    });

    test("should return 400 for invalid product id", async () => {

        const res = await request(app)
            .post("/api/cart/items")
            .set("Authorization", "Bearer token")
            .send({
                productId: "abc",
                qty: 2,
            });

        expect(res.statusCode).toBe(400);
    });

    test("should return 400 for invalid quantity", async () => {

        const productId = new mongoose.Types.ObjectId().toString();

        const res = await request(app)
            .post("/api/cart/items")
            .set("Authorization", "Bearer token")
            .send({
                productId,
                qty: 0,
            });

        expect(res.statusCode).toBe(400);
    });

    test("should return 401 when token is missing", async () => {

        const productId = new mongoose.Types.ObjectId().toString();

        const res = await request(app)
            .post("/api/cart/items")
            .send({
                productId,
                qty: 1,
            });

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe("Unauthorized : No token provided");
    });

    test("should return 403 when role is not user", async () => {

        jwt.verify.mockReturnValue({
            id: "seller123",
            role: "seller",
        });

        const productId = new mongoose.Types.ObjectId().toString();

        const res = await request(app)
            .post("/api/cart/items")
            .set("Authorization", "Bearer token")
            .send({
                productId,
                qty: 1,
            });

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe("Forbidden Insufficient permissions");
    });

    test("should return 500 when database throws error", async () => {

        Cart.findOne.mockRejectedValue(new Error("Database Error"));

        const productId = new mongoose.Types.ObjectId().toString();

        const res = await request(app)
            .post("/api/cart/items")
            .set("Authorization", "Bearer token")
            .send({
                productId,
                qty: 1,
            });

        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe("Internal server error");
    });

});