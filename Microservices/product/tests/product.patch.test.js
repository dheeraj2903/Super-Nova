const request = require("supertest");
const app = require("../src/app");

const Product = require("../src/models/product.model");
const jwt = require("jsonwebtoken");

jest.mock("../src/models/product.model");
jest.mock("jsonwebtoken");

describe("PATCH /api/products/:id", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jwt.verify.mockReturnValue({
      id: "seller123",
      role: "seller",
    });
  });

  test("should update product successfully", async () => {
    const updatedProduct = {
      _id: "product123",
      title: "New iPhone",
      price: {
        amount: 70000,
        currency: "INR",
      },
    };

    Product.findByIdAndUpdate.mockResolvedValue(updatedProduct);

    const res = await request(app)
      .patch("/api/products/product123")
      .set("Authorization", "Bearer token")
      .send({
        title: "New iPhone",
        priceAmount: 70000,
      });

    expect(res.statusCode).toBe(200);

    expect(Product.findByIdAndUpdate).toHaveBeenCalled();

    expect(res.body).toBeDefined();
  });

  test("should return 401 when token is missing", async () => {
    const res = await request(app)
      .patch("/api/products/product123")
      .send({
        title: "New iPhone",
      });

    expect(res.statusCode).toBe(401);
  });

  test("should return 403 for invalid role", async () => {
    jwt.verify.mockReturnValue({
      id: "user123",
      role: "user",
    });

    const res = await request(app)
      .patch("/api/products/product123")
      .set("Authorization", "Bearer token");

    expect(res.statusCode).toBe(403);
  });

  test("should return 404 when product is not found", async () => {
    Product.findByIdAndUpdate.mockResolvedValue(null);

    const res = await request(app)
      .patch("/api/products/product123")
      .set("Authorization", "Bearer token")
      .send({
        title: "Updated",
      });

    expect(res.statusCode).toBe(404);

    expect(res.body.message).toBe("Product not found");
  });

  test("should update only title", async () => {
    Product.findByIdAndUpdate.mockResolvedValue({
      _id: "product123",
      title: "Updated Title",
    });

    await request(app)
      .patch("/api/products/product123")
      .set("Authorization", "Bearer token")
      .send({
        title: "Updated Title",
      });

    expect(Product.findByIdAndUpdate).toHaveBeenCalled();
  });

  test("should update only description", async () => {
    Product.findByIdAndUpdate.mockResolvedValue({
      description: "New Description",
    });

    const res = await request(app)
      .patch("/api/products/product123")
      .set("Authorization", "Bearer token")
      .send({
        description: "New Description",
      });

    expect(res.statusCode).toBe(200);
  });

  test("should update only price", async () => {
    Product.findByIdAndUpdate.mockResolvedValue({
      price: {
        amount: 999,
      },
    });

    const res = await request(app)
      .patch("/api/products/product123")
      .set("Authorization", "Bearer token")
      .send({
        priceAmount: 999,
      });

    expect(res.statusCode).toBe(200);
  });

  test("should return 400 when validation fails", async () => {
    const res = await request(app)
      .patch("/api/products/product123")
      .set("Authorization", "Bearer token")
      .send({
        title: "a",
      });

    expect(res.statusCode).toBe(400);
  });

  test("should return 500 when database throws error", async () => {
    Product.findByIdAndUpdate.mockRejectedValue(
      new Error("Database Error")
    );

    const res = await request(app)
      .patch("/api/products/product123")
      .set("Authorization", "Bearer token")
      .send({
        title: "Updated",
      });

    expect(res.statusCode).toBe(500);

    expect(res.body.message).toBe("Internal server error");
  });
});