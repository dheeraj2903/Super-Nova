const request = require("supertest");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const app = require("../src/app");
const Order = require("../src/models/order.model");

jest.mock("axios");
jest.mock("jsonwebtoken");
jest.mock("../src/models/order.model");

describe("POST /api/orders", () => {

    beforeEach(() => {
        jest.clearAllMocks();

        jwt.verify.mockReturnValue({
            id: "user123",
            username: "testuser",
            email: "test@test.com",
            role: "user"
        });
    });


    test("should create order successfully", async () => {

        axios.get
            // Cart service
            .mockResolvedValueOnce({
                data: {
                    cart: {
                        items: [
                            {
                                productId: "507f1f77bcf86cd799439011",
                                quantity: 2
                            }
                        ]
                    }
                }
            })
            // Product service
            .mockResolvedValueOnce({
                data: {
                    product: {
                        _id: "507f1f77bcf86cd799439011",
                        title: "Test Product",
                        stock: 10,
                        price: {
                            amount: 500,
                            currency: "INR"
                        }
                    }
                }
            });

        const order = {
            _id: "order123",
            user: "user123",
            items: [
                {
                    product: "507f1f77bcf86cd799439011",
                    quantity: 2,
                    price: {
                        amount: 1000,
                        currency: "INR"
                    }
                }
            ],
            status: "PENDING",
            totalPrice: {
                amount: 1000,
                currency: "INR"
            },
            shippingAddress: {
                street: "Main Road",
                city: "Raipur",
                state: "Chhattisgarh",
                zip: "492001",
                country: "India"
            }
        };

        Order.create.mockResolvedValue(order);

        const res = await request(app)
            .post("/api/orders")
            .set("Authorization", "Bearer token")
            .send({
                shippingAddress: {
                    street: "Main Road",
                    city: "Raipur",
                    state: "Chhattisgarh",
                    zip: "492001",
                    country: "India"
                }
            });

        expect(res.statusCode).toBe(201);

        expect(res.body.order).toEqual(order);

        expect(Order.create).toHaveBeenCalledWith({
            user: "user123",
            items: [
                {
                    product: "507f1f77bcf86cd799439011",
                    quantity: 2,
                    price: {
                        amount: 1000,
                        currency: "INR"
                    }
                }
            ],
            status: "PENDING",
            totalPrice: {
                amount: 1000,
                currency: "INR"
            },
            shippingAddress: {
                street: "Main Road",
                city: "Raipur",
                state: "Chhattisgarh",
                zip: "492001",
                country: "India"
            }
        });
    });


    test("should return 400 when shipping address is missing", async () => {

        const res = await request(app)
            .post("/api/orders")
            .set("Authorization", "Bearer token")
            .send({});

        expect(res.statusCode).toBe(400);

        expect(res.body.errors).toBeDefined();

        expect(Order.create).not.toHaveBeenCalled();
        expect(axios.get).not.toHaveBeenCalled();
    });


    test("should return 400 when shipping address fields are invalid", async () => {

        const res = await request(app)
            .post("/api/orders")
            .set("Authorization", "Bearer token")
            .send({
                shippingAddress: {
                    street: "",
                    city: "",
                    state: "",
                    zip: "",
                    country: ""
                }
            });

        expect(res.statusCode).toBe(400);

        expect(res.body.errors).toBeDefined();

        expect(Order.create).not.toHaveBeenCalled();
    });


    test("should return 401 when token is missing", async () => {

        const res = await request(app)
            .post("/api/orders")
            .send({
                shippingAddress: {
                    street: "Main Road",
                    city: "Raipur",
                    state: "Chhattisgarh",
                    zip: "492001",
                    country: "India"
                }
            });

        expect(res.statusCode).toBe(401);

        expect(res.body.message).toBe(
            "Unauthorized : No token provided"
        );

        expect(axios.get).not.toHaveBeenCalled();
        expect(Order.create).not.toHaveBeenCalled();
    });


    test("should return 403 when role is not user", async () => {

        jwt.verify.mockReturnValue({
            id: "seller123",
            role: "seller"
        });

        const res = await request(app)
            .post("/api/orders")
            .set("Authorization", "Bearer token")
            .send({
                shippingAddress: {
                    street: "Main Road",
                    city: "Raipur",
                    state: "Chhattisgarh",
                    zip: "492001",
                    country: "India"
                }
            });

        expect(res.statusCode).toBe(403);

        expect(res.body.message).toBe(
            "Forbidden Insufficient permissions"
        );

        expect(axios.get).not.toHaveBeenCalled();
        expect(Order.create).not.toHaveBeenCalled();
    });


    test("should return 500 when cart service fails", async () => {

        axios.get.mockRejectedValueOnce(
            new Error("Cart service unavailable")
        );

        const res = await request(app)
            .post("/api/orders")
            .set("Authorization", "Bearer token")
            .send({
                shippingAddress: {
                    street: "Main Road",
                    city: "Raipur",
                    state: "Chhattisgarh",
                    zip: "492001",
                    country: "India"
                }
            });

        expect(res.statusCode).toBe(500);

        expect(res.body.message).toBe("Internal server error");
        expect(res.body.error).toBe("Cart service unavailable");

        expect(Order.create).not.toHaveBeenCalled();
    });


    test("should return 500 when product service fails", async () => {

        // Cart service
        axios.get.mockResolvedValueOnce({
            data: {
                cart: {
                    items: [
                        {
                            productId: "507f1f77bcf86cd799439011",
                            quantity: 2
                        }
                    ]
                }
            }
        });

        // Product service
        axios.get.mockRejectedValueOnce(
            new Error("Product service unavailable")
        );

        const res = await request(app)
            .post("/api/orders")
            .set("Authorization", "Bearer token")
            .send({
                shippingAddress: {
                    street: "Main Road",
                    city: "Raipur",
                    state: "Chhattisgarh",
                    zip: "492001",
                    country: "India"
                }
            });

        expect(res.statusCode).toBe(500);

        expect(res.body.message).toBe("Internal server error");
        expect(res.body.error).toBe("Product service unavailable");

        expect(Order.create).not.toHaveBeenCalled();
    });


    test("should return 500 when product is out of stock", async () => {

        axios.get
            .mockResolvedValueOnce({
                data: {
                    cart: {
                        items: [
                            {
                                productId: "507f1f77bcf86cd799439011",
                                quantity: 5
                            }
                        ]
                    }
                }
            })
            .mockResolvedValueOnce({
                data: {
                    product: {
                        _id: "507f1f77bcf86cd799439011",
                        title: "Test Product",
                        stock: 2,
                        price: {
                            amount: 500,
                            currency: "INR"
                        }
                    }
                }
            });

        const res = await request(app)
            .post("/api/orders")
            .set("Authorization", "Bearer token")
            .send({
                shippingAddress: {
                    street: "Main Road",
                    city: "Raipur",
                    state: "Chhattisgarh",
                    zip: "492001",
                    country: "India"
                }
            });

        expect(res.statusCode).toBe(500);

        expect(res.body.message).toBe("Internal server error");

        expect(res.body.error).toBe(
            "Product Test Product is out of stock or insufficient stock"
        );

        expect(Order.create).not.toHaveBeenCalled();
    });


    test("should return 500 when order creation fails", async () => {

        axios.get
            .mockResolvedValueOnce({
                data: {
                    cart: {
                        items: [
                            {
                                productId: "507f1f77bcf86cd799439011",
                                quantity: 2
                            }
                        ]
                    }
                }
            })
            .mockResolvedValueOnce({
                data: {
                    product: {
                        _id: "507f1f77bcf86cd799439011",
                        title: "Test Product",
                        stock: 10,
                        price: {
                            amount: 500,
                            currency: "INR"
                        }
                    }
                }
            });

        Order.create.mockRejectedValueOnce(
            new Error("Database Error")
        );

        const res = await request(app)
            .post("/api/orders")
            .set("Authorization", "Bearer token")
            .send({
                shippingAddress: {
                    street: "Main Road",
                    city: "Raipur",
                    state: "Chhattisgarh",
                    zip: "492001",
                    country: "India"
                }
            });

        expect(res.statusCode).toBe(500);

        expect(res.body.message).toBe("Internal server error");
        expect(res.body.error).toBe("Database Error");
    });

});