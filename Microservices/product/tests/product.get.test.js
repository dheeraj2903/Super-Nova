const request = require("supertest");
const app = require("../src/app");

const Product = require("../src/models/product.model");

jest.mock("../src/models/product.model");

describe("GET /api/products", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return all products", async () => {
    const products = [
      {
        _id: "1",
        title: "iPhone",
        price: { amount: 50000, currency: "INR" },
      },
      {
        _id: "2",
        title: "MacBook",
        price: { amount: 120000, currency: "INR" },
      },
    ];

    Product.find.mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue(products),
      }),
    });

    const res = await request(app).get("/api/products");

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual(products);
    expect(Product.find).toHaveBeenCalledWith({});
  });

  test("should search products by text", async () => {
    Product.find.mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([]),
      }),
    });

    const res = await request(app).get("/api/products?q=iphone");

    expect(res.statusCode).toBe(200);

    expect(Product.find).toHaveBeenCalledWith({
      $text: {
        search: "iphone",
      },
    });
  });

  test("should filter by minimum price", async () => {
    Product.find.mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([]),
      }),
    });

    await request(app).get("/api/products?minprice=100");

    expect(Product.find).toHaveBeenCalledWith({
      "price.amount": {
        $gte: 100,
      },
    });
  });

  test("should filter by maximum price", async () => {
    Product.find.mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([]),
      }),
    });

    await request(app).get("/api/products?maxprice=1000");

    expect(Product.find).toHaveBeenCalledWith({
      "price.amount": {
        $lte: 1000,
      },
    });
  });

  test("should filter by minimum and maximum price together", async () => {
    Product.find.mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([]),
      }),
    });

    await request(app).get("/api/products?minprice=100&maxprice=1000");

    expect(Product.find).toHaveBeenCalledWith({
      "price.amount": {
        $gte: 100,
        $lte: 1000,
      },
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

    await request(app).get("/api/products?skip=10&limit=5");

    expect(skip).toHaveBeenCalledWith(10);
    expect(limit).toHaveBeenCalledWith(5);
  });

  test("should combine search and price filter", async () => {
    Product.find.mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([]),
      }),
    });

    await request(app).get("/api/products?q=iphone&minprice=100");

    expect(Product.find).toHaveBeenCalledWith({
      $text: {
        search: "iphone",
      },
      "price.amount": {
        $gte: 100,
      },
    });
  });

  test("should combine search with minprice and maxprice", async () => {
    Product.find.mockReturnValue({
      skip: jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([]),
      }),
    });

    await request(app).get(
      "/api/products?q=iphone&minprice=100&maxprice=1000"
    );

    expect(Product.find).toHaveBeenCalledWith({
      $text: {
        search: "iphone",
      },
      "price.amount": {
        $gte: 100,
        $lte: 1000,
      },
    });
  });

  test("should use default pagination values", async () => {
    const limit = jest.fn().mockResolvedValue([]);
    const skip = jest.fn().mockReturnValue({
      limit,
    });

    Product.find.mockReturnValue({
      skip,
    });

    await request(app).get("/api/products");

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

    await request(app).get("/api/products?limit=100");

    expect(limit).toHaveBeenCalledWith(20);
  });

  test("should return 500 when database throws error", async () => {
    Product.find.mockImplementation(() => {
      throw new Error("Database Error");
    });

    const res = await request(app).get("/api/products");

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Internal server error");
  });
});