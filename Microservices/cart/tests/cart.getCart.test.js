const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../src/app");
const Cart = require("../src/models/cart.model");

jest.mock("../src/models/cart.model");
jest.mock("jsonwebtoken");

describe("GET /api/cart", () => {

    beforeEach(() => {

        jest.clearAllMocks();

        jwt.verify.mockReturnValue({
            _id: "user123",
            role: "user"
        });

    });

    test("should return cart", async () => {

        const cart = {
            items: [
                { quantity: 2 },
                { quantity: 3 }
            ]
        };

        Cart.findOne.mockResolvedValue(cart);

        const res = await request(app)
            .get("/api/cart")
            .set("Authorization", "Bearer token");

        expect(res.statusCode).toBe(200);

        expect(res.body.totals).toEqual({
            iteCount: 2,
            totalQuantity: 5
        });

    });

    test("should create cart when cart does not exist", async () => {

        Cart.findOne.mockResolvedValue(null);

        const save = jest.fn().mockResolvedValue(true);

        Cart.mockImplementation(function () {
            return {
                user: "user123",
                items: [],
                save
            };
        });

        const res = await request(app)
            .get("/api/cart")
            .set("Authorization", "Bearer token");

        expect(res.statusCode).toBe(200);
        expect(save).toHaveBeenCalled();

    });

    test("should return 401 when token missing", async () => {

        const res = await request(app)
            .get("/api/cart");

        expect(res.statusCode).toBe(401);

    });

    test("should return 403 when role is invalid", async () => {

        jwt.verify.mockReturnValue({
            _id: "seller123",
            role: "seller"
        });

        const res = await request(app)
            .get("/api/cart")
            .set("Authorization", "Bearer token");

        expect(res.statusCode).toBe(403);

    });

    test("should return 500 when database throws error", async () => {

        Cart.findOne.mockRejectedValue(new Error("DB Error"));

        const res = await request(app)
            .get("/api/cart")
            .set("Authorization", "Bearer token");

        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe("Internal server error");

    });

});