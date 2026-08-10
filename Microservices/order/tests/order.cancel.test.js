const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../src/app");
const orderModel = require("../src/models/order.model");

jest.mock("jsonwebtoken");
jest.mock("../src/models/order.model");

describe("POST /api/orders/:id/cancel", () => {

    beforeEach(() => {
        jest.clearAllMocks();

        jwt.verify.mockReturnValue({
            id: "user123",
            username: "testuser",
            email: "test@test.com",
            role: "user"
        });
    });


    test("should cancel pending order successfully", async () => {

        const order = {
            _id: "order123",
            user: "user123",
            status: "PENDING",
            save: jest.fn().mockResolvedValue(true)
        };

        orderModel.findById.mockResolvedValue(order);

        const res = await request(app)
            .post("/api/orders/order123/cancel")
            .set("Authorization", "Bearer token");

        expect(res.statusCode).toBe(200);

        expect(order.status).toBe("CANCELLED");
        expect(order.save).toHaveBeenCalled();

        expect(res.body.order._id).toBe("order123");
        expect(res.body.order.user).toBe("user123");
        expect(res.body.order.status).toBe("CANCELLED");
    });


    test("should return 404 when order does not exist", async () => {

        orderModel.findById.mockResolvedValue(null);

        const res = await request(app)
            .post("/api/orders/order123/cancel")
            .set("Authorization", "Bearer token");

        expect(res.statusCode).toBe(404);

        expect(res.body.message).toBe("Order not found");
    });


    test("should return 403 when user tries to cancel another user's order", async () => {

        const order = {
            _id: "order123",
            user: "anotherUser123",
            status: "PENDING",
            save: jest.fn()
        };

        orderModel.findById.mockResolvedValue(order);

        const res = await request(app)
            .post("/api/orders/order123/cancel")
            .set("Authorization", "Bearer token");

        expect(res.statusCode).toBe(403);

        expect(res.body.message).toBe(
            "Forbidden: You do not have access to this order"
        );

        expect(order.save).not.toHaveBeenCalled();
    });


    test("should return 409 when order is not pending", async () => {

        const order = {
            _id: "order123",
            user: "user123",
            status: "CONFIRMED",
            save: jest.fn()
        };

        orderModel.findById.mockResolvedValue(order);

        const res = await request(app)
            .post("/api/orders/order123/cancel")
            .set("Authorization", "Bearer token");

        expect(res.statusCode).toBe(409);

        expect(res.body.message).toBe(
            "Order cannot be cancelled at this point"
        );

        expect(order.save).not.toHaveBeenCalled();
    });


    test("should return 401 when token is missing", async () => {

        const res = await request(app)
            .post("/api/orders/order123/cancel");

        expect(res.statusCode).toBe(401);

        expect(res.body.message).toBe(
            "Unauthorized : No token provided"
        );

        expect(orderModel.findById).not.toHaveBeenCalled();
    });


    test("should return 403 when seller tries to cancel order", async () => {

        jwt.verify.mockReturnValue({
            id: "seller123",
            username: "seller",
            email: "seller@test.com",
            role: "seller"
        });

        const res = await request(app)
            .post("/api/orders/order123/cancel")
            .set("Authorization", "Bearer seller-token");

        expect(res.statusCode).toBe(403);

        expect(res.body.message).toBe(
            "Forbidden Insufficient permissions"
        );

        expect(orderModel.findById).not.toHaveBeenCalled();
    });


    test("should return 401 when token is invalid", async () => {

        jwt.verify.mockImplementation(() => {
            throw new Error("Invalid token");
        });

        const res = await request(app)
            .post("/api/orders/order123/cancel")
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
            .post("/api/orders/order123/cancel")
            .set("Authorization", "Bearer token");

        expect(res.statusCode).toBe(500);

        expect(res.body.message).toBe("Interval server error");
        expect(res.body.error).toBe("Database Error");
    });

});