const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const app = require("../src/app");
const Product = require("../src/models/product.model");

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

  test("should update product title", async () => {

    const product = {
      seller: {
        toString: () => "seller123",
      },
      title: "Old Title",
      description: "Old Description",
      price: {
        amount: 100,
        currency: "INR",
      },
      save: jest.fn().mockResolvedValue(true),
    };

    Product.findOne.mockResolvedValue(product);

    const id = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .patch(`/api/products/${id}`)
      .set("Authorization", "Bearer token")
      .send({
        title: "New Title",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Product updated");
    expect(product.title).toBe("New Title");
    expect(product.save).toHaveBeenCalled();
  });

  test("should return 400 for invalid product id", async () => {

    const res = await request(app)
      .patch("/api/products/abc")
      .set("Authorization", "Bearer token")
      .send({
        title: "Phone",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid product id");
  });

  test("should return 401 when token is missing", async () => {

    const id = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .patch(`/api/products/${id}`)
      .send({
        title: "Phone",
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized : No token provided");
  });

  test("should return 403 when user is not seller", async () => {

    const product = {
      seller: {
        toString: () => "anotherSeller",
      },
      save: jest.fn(),
    };

    Product.findOne.mockResolvedValue(product);

    const id = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .patch(`/api/products/${id}`)
      .set("Authorization", "Bearer token")
      .send({
        title: "Phone",
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe(
      "Forbidden: You can only update your own product"
    );
  });

  test("should return 404 when product does not exist", async () => {

    Product.findOne.mockResolvedValue(null);

    const id = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .patch(`/api/products/${id}`)
      .set("Authorization", "Bearer token");

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Product not found");
  });

  test("should update product price", async () => {

    const product = {
      seller: {
        toString: () => "seller123",
      },
      price: {
        amount: 100,
        currency: "INR",
      },
      save: jest.fn().mockResolvedValue(true),
    };

    Product.findOne.mockResolvedValue(product);

    const id = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .patch(`/api/products/${id}`)
      .set("Authorization", "Bearer token")
      .send({
        price: {
          amount: 500,
          currency: "USD",
        },
      });

    expect(res.statusCode).toBe(200);

    expect(product.price.amount).toBe(500);
    expect(product.price.currency).toBe("USD");

    expect(product.save).toHaveBeenCalled();
  });

  test("should ignore fields that are not allowed", async () => {

    const product = {
      seller: {
        toString: () => "seller123",
      },
      title: "Phone",
      save: jest.fn().mockResolvedValue(true),
    };

    Product.findOne.mockResolvedValue(product);

    const id = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .patch(`/api/products/${id}`)
      .set("Authorization", "Bearer token")
      .send({
        seller: "hacker",
        createdAt: "2020",
      });

    expect(res.statusCode).toBe(200);

    expect(product.seller.toString()).toBe("seller123");

    expect(product.save).toHaveBeenCalled();
  });

})