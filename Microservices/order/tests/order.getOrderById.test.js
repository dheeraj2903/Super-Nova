const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../src/app");
const orderModel = require("../src/models/order.model");

jest.mock("jsonwebtoken");
jest.mock("../src/models/order.model");

describe("GET /api/orders/:id", () => {

    beforeEach(() => {
        jest.clearAllMocks();

        jwt.verify.mockReturnValue({
            id: "user123",
            username: "testuser",
            email: "test@test.com",
            role: "user"
        });
    });


    test("should return order when order belongs to user", async () => {

        const order = {
            _id: "order123",
            user: "user123",
            items: [],
            status: "PENDING"
        };

        orderModel.findById.mockResolvedValue(order);

        const res = await request(app)
            .get("/api/orders/order123")
            .set("Authorization", "Bearer token");

        expect(res.statusCode).toBe(200);

        expect(res.body.order).toEqual(order);

        expect(orderModel.findById).toHaveBeenCalledWith("order123");
    });


    test("should return 403 when admin requests another user's order", async () => {

        jwt.verify.mockReturnValue({
            id: "admin123",
            username: "admin",
            email: "admin@test.com",
            role: "admin"
        });

        const order = {
            _id: "order123",
            user: "user456",
            items: [],
            status: "PENDING"
        };

        orderModel.findById.mockResolvedValue(order);

        const res = await request(app)
            .get("/api/orders/order123")
            .set("Authorization", "Bearer admin-token");

        expect(res.statusCode).toBe(403);

        expect(res.body.message).toBe(
            "Forbidden: You do not have access to this order"
        );

        expect(orderModel.findById).toHaveBeenCalledWith("order123");
    });


    test("should return 404 when order does not exist", async () => {

        orderModel.findById.mockResolvedValue(null);

        const res = await request(app)
            .get("/api/orders/order123")
            .set("Authorization", "Bearer token");

        expect(res.statusCode).toBe(404);

        expect(res.body.message).toBe("Order not found");
    });


    test("should return 403 when user tries to access another user's order", async () => {

        const order = {
            _id: "order123",
            user: "anotherUser123",
            items: [],
            status: "PENDING"
        };

        orderModel.findById.mockResolvedValue(order);

        const res = await request(app)
            .get("/api/orders/order123")
            .set("Authorization", "Bearer token");

        expect(res.statusCode).toBe(403);

        expect(res.body.message).toBe(
            "Forbidden: You do not have access to this order"
        );
    });


    test("should return 403 when role is seller", async () => {

        jwt.verify.mockReturnValue({
            id: "seller123",
            username: "seller",
            email: "seller@test.com",
            role: "seller"
        });

        const res = await request(app)
            .get("/api/orders/order123")
            .set("Authorization", "Bearer seller-token");

        expect(res.statusCode).toBe(403);

        expect(res.body.message).toBe(
            "Forbidden Insufficient permissions"
        );

        expect(orderModel.findById).not.toHaveBeenCalled();
    });


    test("should return 401 when token is missing", async () => {

        const res = await request(app)
            .get("/api/orders/order123");

        expect(res.statusCode).toBe(401);

        expect(res.body.message).toBe(
            "Unauthorized : No token provided"
        );

        expect(orderModel.findById).not.toHaveBeenCalled();
    });


    test("should return 401 when token is invalid", async () => {

        jwt.verify.mockImplementation(() => {
            throw new Error("Invalid token");
        });

        const res = await request(app)
            .get("/api/orders/order123")
            .set("Authorization", "Bearer invalid-token");

        expect(res.statusCode).toBe(401);

        expect(res.body.message).toBe(
            "Unauthorized: Invalid token"
        );

        expect(orderModel.findById).not.toHaveBeenCalled();
    });


    test("should return 500 when database throws error", async () => {

        orderModel.findById.mockRejectedValue(
            new Error("Database Error")
        );

        const res = await request(app)
            .get("/api/orders/order123")
            .set("Authorization", "Bearer token");

        expect(res.statusCode).toBe(500);

        expect(res.body.message).toBe(
            "Internal server error"
        );
    });

});