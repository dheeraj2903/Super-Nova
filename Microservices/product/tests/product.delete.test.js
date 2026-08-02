const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const app = require("../src/app");
const Product = require("../src/models/product.model");

jest.mock("../src/models/product.model");
jest.mock("jsonwebtoken");

describe("DELETE /api/products/:id", () => {

  beforeEach(() => {
    jest.clearAllMocks();

    jwt.verify.mockReturnValue({
      id: "seller123",
      role: "seller",
    });
  });

  test("should delete product successfully", async () => {

    const product = {
      seller: {
        toString: () => "seller123",
      },
    };

    Product.findOne.mockResolvedValue(product);
    Product.findOneAndDelete.mockResolvedValue(product);

    const id = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .delete(`/api/products/${id}`)
      .set("Authorization", "Bearer token");

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Product deleted");

    expect(Product.findOne).toHaveBeenCalledWith({
      _id: id,
    });

    expect(Product.findOneAndDelete).toHaveBeenCalledWith({
      _id: id,
    });
  });

  test("should return 400 for invalid product id", async () => {

    const res = await request(app)
      .delete("/api/products/abc")
      .set("Authorization", "Bearer token");

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid product id");
  });

  test("should return 401 when token is missing", async () => {

    const id = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .delete(`/api/products/${id}`);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized : No token provided");
  });

  test("should return 403 when user role is not seller", async () => {

    jwt.verify.mockReturnValue({
      id: "user123",
      role: "user",
    });

    const id = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .delete(`/api/products/${id}`)
      .set("Authorization", "Bearer token");

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("Forbidden Insufficient permissions");
  });

  test("should return 403 when seller is not owner", async () => {

    const product = {
      seller: {
        toString: () => "anotherSeller",
      },
    };

    Product.findOne.mockResolvedValue(product);

    const id = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .delete(`/api/products/${id}`)
      .set("Authorization", "Bearer token");

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe(
      "Forbidden: You can only delte your own products"
    );

    expect(Product.findOneAndDelete).not.toHaveBeenCalled();
  });

  test("should return 404 when product does not exist", async () => {

    Product.findOne.mockResolvedValue(null);

    const id = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .delete(`/api/products/${id}`)
      .set("Authorization", "Bearer token");

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Product not found");

    expect(Product.findOneAndDelete).not.toHaveBeenCalled();
  });

  test("should return 500 when database throws error", async () => {

    Product.findOne.mockRejectedValue(new Error("Database Error"));

    const id = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .delete(`/api/products/${id}`)
      .set("Authorization", "Bearer token");

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Internal server error");
  });

});