const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../src/app");
const Product = require("../src/models/product.model");

jest.mock("../src/models/product.model");
jest.mock("jsonwebtoken");

describe("GET /api/products/seller", () => {

  beforeEach(() => {
    jest.clearAllMocks();

    jwt.verify.mockReturnValue({
      id: "seller123",
      role: "seller",
    });
  });

  test("should return all products of logged in seller", async () => {

    const products = [
      {
        _id: "1",
        title: "iPhone",
        seller: "seller123",
      },
      {
        _id: "2",
        title: "MacBook",
        seller: "seller123",
      },
    ];

    Product.find.mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue(products),
      }),
    });

    const res = await request(app)
      .get("/api/products/seller")
      .set("Authorization", "Bearer token");

    expect(res.statusCode).toBe(200);

    expect(res.body.data).toEqual(products);

    expect(Product.find).toHaveBeenCalledWith({
      seller: "seller123",
    });
  });

  test("should apply pagination", async () => {

    const limit = jest.fn().mockResolvedValue([]);

    const skip = jest.fn().mockReturnValue({
      limit,
    });

    Product.find.mockReturnValue({
      skip,
    });

    await request(app)
      .get("/api/products/seller?skip=5&limit=10")
      .set("Authorization", "Bearer token");

    expect(skip).toHaveBeenCalledWith("5");
    expect(limit).toHaveBeenCalledWith(10);
  });

  test("should use default pagination", async () => {

    const limit = jest.fn().mockResolvedValue([]);

    const skip = jest.fn().mockReturnValue({
      limit,
    });

    Product.find.mockReturnValue({
      skip,
    });

    await request(app)
      .get("/api/products/seller")
      .set("Authorization", "Bearer token");

    expect(skip).toHaveBeenCalledWith(0);
    expect(limit).toHaveBeenCalledWith(20);
  });

  test("should limit maximum page size to 20", async () => {

    const limit = jest.fn().mockResolvedValue([]);

    const skip = jest.fn().mockReturnValue({
      limit,
    });

    Product.find.mockReturnValue({
      skip,
    });

    await request(app)
      .get("/api/products/seller?limit=100")
      .set("Authorization", "Bearer token");

    expect(limit).toHaveBeenCalledWith(20);
  });

  test("should return 401 when token is missing", async () => {

    const res = await request(app)
      .get("/api/products/seller");

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized : No token provided");
  });

  test("should return 403 when role is not seller", async () => {

    jwt.verify.mockReturnValue({
      id: "user123",
      role: "user",
    });

    const res = await request(app)
      .get("/api/products/seller")
      .set("Authorization", "Bearer token");

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("Forbidden Insufficient permissions");
  });

  test("should return 500 when database throws error", async () => {

    Product.find.mockImplementation(() => {
      throw new Error("Database Error");
    });

    const res = await request(app)
      .get("/api/products/seller")
      .set("Authorization", "Bearer token");

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Internal server error");
  });

});