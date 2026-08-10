const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../src/app");
const orderModel = require("../src/models/order.model");

jest.mock("jsonwebtoken");
jest.mock("../src/models/order.model");

describe("GET /api/orders/me", () => {

    beforeEach(() => {
        jest.clearAllMocks();

        jwt.verify.mockReturnValue({
            id: "user123",
            username: "testuser",
            email: "test@test.com",
            role: "user"
        });
    });


    test("should return user's orders", async () => {

        const orders = [
            {
                _id: "order3",
                user: "user123",
                status: "PENDING"
            },
            {
                _id: "order2",
                user: "user123",
                status: "CONFIRMED"
            }
        ];

        const sort = jest.fn().mockResolvedValue(orders);

        orderModel.find.mockReturnValue({
            skip: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                    sort
                })
            })
        });

        orderModel.countDocuments.mockResolvedValue(2);

        const res = await request(app)
            .get("/api/orders/me")
            .set("Authorization", "Bearer token");

        expect(res.statusCode).toBe(200);

        expect(res.body.orders).toEqual(orders);

        expect(res.body.meta).toEqual({
            total: 2,
            page: 1,
            limit: 10
        });

        expect(orderModel.find).toHaveBeenCalledWith({
            user: "user123"
        });

        expect(orderModel.countDocuments).toHaveBeenCalledWith({
            user: "user123"
        });
    });


    test("should apply pagination", async () => {

        const orders = [
            {
                _id: "order11",
                user: "user123"
            }
        ];

        const sort = jest.fn().mockResolvedValue(orders);
        const limit = jest.fn().mockReturnValue({
            sort
        });
        const skip = jest.fn().mockReturnValue({
            limit
        });

        orderModel.find.mockReturnValue({
            skip
        });

        orderModel.countDocuments.mockResolvedValue(25);

        const res = await request(app)
            .get("/api/orders/me?page=2&limit=10")
            .set("Authorization", "Bearer token");

        expect(res.statusCode).toBe(200);

        expect(skip).toHaveBeenCalledWith(10);
        expect(limit).toHaveBeenCalledWith(10);

        expect(res.body.meta).toEqual({
            total: 25,
            page: 2,
            limit: 10
        });
    });


    test("should use default page and limit", async () => {

        const sort = jest.fn().mockResolvedValue([]);

        const limit = jest.fn().mockReturnValue({
            sort
        });

        const skip = jest.fn().mockReturnValue({
            limit
        });

        orderModel.find.mockReturnValue({
            skip
        });

        orderModel.countDocuments.mockResolvedValue(0);

        const res = await request(app)
            .get("/api/orders/me")
            .set("Authorization", "Bearer token");

        expect(res.statusCode).toBe(200);

        expect(skip).toHaveBeenCalledWith(0);
        expect(limit).toHaveBeenCalledWith(10);

        expect(res.body.meta).toEqual({
            total: 0,
            page: 1,
            limit: 10
        });
    });


    test("should return 401 when token is missing", async () => {

        const res = await request(app)
            .get("/api/orders/me");

        expect(res.statusCode).toBe(401);

        expect(res.body.message).toBe(
            "Unauthorized : No token provided"
        );

        expect(orderModel.find).not.toHaveBeenCalled();
        expect(orderModel.countDocuments).not.toHaveBeenCalled();
    });


    test("should return 403 when role is not user", async () => {

        jwt.verify.mockReturnValue({
            id: "seller123",
            username: "seller",
            email: "seller@test.com",
            role: "seller"
        });

        const res = await request(app)
            .get("/api/orders/me")
            .set("Authorization", "Bearer token");

        expect(res.statusCode).toBe(403);

        expect(res.body.message).toBe(
            "Forbidden Insufficient permissions"
        );

        expect(orderModel.find).not.toHaveBeenCalled();
        expect(orderModel.countDocuments).not.toHaveBeenCalled();
    });


    test("should return 500 when database throws error", async () => {

        orderModel.find.mockImplementation(() => {
            throw new Error("Database Error");
        });

        const res = await request(app)
            .get("/api/orders/me")
            .set("Authorization", "Bearer token");

        expect(res.statusCode).toBe(500);

        expect(res.body.message).toBe(
            "Interval server error"
        );
    });

});