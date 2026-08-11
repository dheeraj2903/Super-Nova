require("dotenv").config();
const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../src/app");
const orderModel = require("../src/models/order.model");

jest.mock("../src/models/order.model");

describe("PATCH /api/orders/:id/address", () => {

    const userId = "6a63a22c3176e89124892df1";
    const orderId = "6a74482fe8eb0c355604829f";

    const token = jwt.sign(
        {
            id: userId,
            username: "test@123",
            email: "test@test.com",
            role: "user"
        },
        process.env.JWT_SECRET
    );

    const address = {
        street: "Main Street",
        city: "Raipur",
        state: "Chhattisgarh",
        pincode: "492001",
        country: "India"
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });


    // 1. SUCCESS
    test("should update order address successfully", async () => {

        const order = {
            _id: orderId,
            user: {
                toString: () => userId
            },
            status: "PENDING",
            shippingAddress: {},

            save: jest.fn().mockResolvedValue(true)
        };

        orderModel.findById.mockResolvedValue(order);

        const res = await request(app)
            .patch(`/api/orders/${orderId}/address`)
            .set("Authorization", `Bearer ${token}`)
            .send({ shippingAddress: address });

        expect(res.statusCode).toBe(200);

        expect(order.shippingAddress).toEqual({
            street: "Main Street",
            city: "Raipur",
            state: "Chhattisgarh",
            zip: "492001",
            country: "India"
        });

        expect(order.save).toHaveBeenCalled();
        expect(res.body.order).toBeDefined();
    });


    // 2. ORDER NOT FOUND
    test("should return 404 when order does not exist", async () => {

        orderModel.findById.mockResolvedValue(null);

        const res = await request(app)
            .patch(`/api/orders/${orderId}/address`)
            .set("Authorization", `Bearer ${token}`)
            .send({ shippingAddress: address });

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("Order not found");
    });


    // 3. USER DOES NOT OWN ORDER
    test("should return 403 when user does not own the order", async () => {

        const order = {
            _id: orderId,
            user: {
                toString: () => "different-user-id"
            },
            status: "PENDING"
        };

        orderModel.findById.mockResolvedValue(order);

        const res = await request(app)
            .patch(`/api/orders/${orderId}/address`)
            .set("Authorization", `Bearer ${token}`)
            .send({ shippingAddress: address });

        expect(res.statusCode).toBe(403);

        expect(res.body.message)
            .toBe("Forbidden: You do not have access to this order");
    });


    // 4. ORDER NOT PENDING
    test("should return 409 when order is not pending", async () => {

        const order = {
            _id: orderId,
            user: {
                toString: () => userId
            },
            status: "CONFIRMED"
        };

        orderModel.findById.mockResolvedValue(order);

        const res = await request(app)
            .patch(`/api/orders/${orderId}/address`)
            .set("Authorization", `Bearer ${token}`)
            .send({ shippingAddress: address });

        expect(res.statusCode).toBe(409);

        expect(res.body.message)
            .toBe("Order address cannot be updated at this point");
    });


    // 5. NO TOKEN
    test("should return 401 when token is missing", async () => {

        const res = await request(app)
            .patch(`/api/orders/${orderId}/address`)
            .send({ shippingAddress: address });

        expect(res.statusCode).toBe(401);

        expect(res.body.message)
            .toBe("Unauthorized : No token provided");
    });


    // 6. INVALID ROLE
    test("should return 403 when role is not user", async () => {

        const sellerToken = jwt.sign(
            {
                id: userId,
                username: "seller",
                email: "seller@test.com",
                role: "seller"
            },
            process.env.JWT_SECRET
        );

        const res = await request(app)
            .patch(`/api/orders/${orderId}/address`)
            .set("Authorization", `Bearer ${sellerToken}`)
            .send({ shippingAddress: address });

        expect(res.statusCode).toBe(403);

        expect(res.body.message)
            .toBe("Forbidden Insufficient permissions");
    });


    // 7. VALIDATION ERROR
    test("should return 400 when shipping address is invalid", async () => {

        const res = await request(app)
            .patch(`/api/orders/${orderId}/address`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                shippingAddress: {
                    street: "",
                    city: "Raipur",
                    state: "Chhattisgarh",
                    pincode: "492001",
                    country: "India"
                }
            });

        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
    });


    // 8. DATABASE ERROR
    test("should return 500 when database throws an error", async () => {

        orderModel.findById.mockRejectedValue(
            new Error("Database Error")
        );

        const res = await request(app)
            .patch(`/api/orders/${orderId}/address`)
            .set("Authorization", `Bearer ${token}`)
            .send({ shippingAddress: address });

        expect(res.statusCode).toBe(500);

        expect(res.body.message).toBe("Internal server error");
        expect(res.body.error).toBe("Database Error");
    });

});