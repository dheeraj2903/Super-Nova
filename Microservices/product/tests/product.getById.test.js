const request = require("supertest");
const app = require("../src/app");

const Product = require("../src/models/product.model");

jest.mock("../src/models/product.model");

describe("GET /api/products/:id", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return a product by id", async () => {
    const product = {
      id: "688c6b8e7e79b0d4d9fd1234",
      title: "iPhone 16",
      description: "Apple Phone",
      price: {
        amount: 50000,
        currency: "INR",
      },
    };

    Product.findById.mockResolvedValue(product);

    const res = await request(app).get(
      "/api/products/688c6b8e7e79b0d4d9fd1234"
    );

    expect(res.statusCode).toBe(200);

    expect(res.body.product).toEqual(product);

    expect(Product.findById).toHaveBeenCalledTimes(1);
    expect(Product.findById).toHaveBeenCalledWith(
      "688c6b8e7e79b0d4d9fd1234"
    );
  });

  test("should return 404 if product does not exist", async () => {
    Product.findById.mockResolvedValue(null);

    const res = await request(app).get(
      "/api/products/688c6b8e7e79b0d4d9fd1234"
    );

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Product not found");

    expect(Product.findById).toHaveBeenCalledWith(
      "688c6b8e7e79b0d4d9fd1234"
    );
  });

  test("should return 500 when database throws error", async () => {
    Product.findById.mockRejectedValue(new Error("Database Error"));

    const res = await request(app).get(
      "/api/products/688c6b8e7e79b0d4d9fd1234"
    );

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Internal server error");
  });
});