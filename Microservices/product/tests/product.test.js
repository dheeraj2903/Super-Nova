const request = require("supertest");
const app = require("../src/app");

const Product = require("../src/models/product.model");
const imagekitService = require("../src/services/imagekit.service");
const jwt = require("jsonwebtoken");

jest.mock("../src/models/product.model");
jest.mock("../src/services/imagekit.service");
jest.mock("jsonwebtoken");

describe("POST /api/products", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  const validUser = {
    id: "seller123",
    role: "seller",
  };

  test("should create a product successfully", async () => {
    jwt.verify.mockReturnValue(validUser);

    imagekitService.uploadImage.mockResolvedValue({
      url: "https://imagekit.io/image.jpg",
      fileId: "123",
    });

    Product.create.mockResolvedValue({
      id: "product123",
      title: "iPhone",
      description: "Latest iPhone",
      seller: "seller123",
      price: {
        amount: 50000,
        currency: "INR",
      },
      images: [
        {
          url: "https://imagekit.io/image.jpg",
          fileId: "123",
        },
      ],
    });

    const res = await request(app)
      .post("/api/products")
      .set("Authorization", "Bearer validtoken")
      .field("title", "iPhone")
      .field("description", "Latest iPhone")
      .field("priceAmount", "50000")
      .field("priceCurrency", "INR")
      .attach("images", Buffer.from("fake image"), "phone.jpg");

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Product created");

    expect(Product.create).toHaveBeenCalledTimes(1);
    expect(imagekitService.uploadImage).toHaveBeenCalledTimes(1);
  });

  test("should return 401 when token is missing", async () => {
    const res = await request(app)
      .post("/api/products")
      .field("title", "iPhone")
      .field("priceAmount", "50000");

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized : No token provided");
  });

  test("should return 401 for invalid token", async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error("Invalid Token");
    });

    const res = await request(app)
      .post("/api/products")
      .set("Authorization", "Bearer invalidtoken")
      .field("title", "iPhone")
      .field("priceAmount", "50000");

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized: Invalid token");
  });

  test("should return 403 when user role is not allowed", async () => {
    jwt.verify.mockReturnValue({
      id: "user123",
      role: "user",
    });

    const res = await request(app)
      .post("/api/products")
      .set("Authorization", "Bearer token")
      .field("title", "iPhone")
      .field("priceAmount", "50000");

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe(
      "Forbidden Insufficient permissions"
    );
  });

  test("should return 400 when validation fails", async () => {
    jwt.verify.mockReturnValue(validUser);

    const res = await request(app)
      .post("/api/products")
      .set("Authorization", "Bearer token")
      .field("title", "ab")
      .field("priceAmount", "-10");

    expect(res.statusCode).toBe(400);

    expect(res.body.message).toBe("Validation failed");
    expect(res.body.errors).toBeDefined();
  });

  test("should return 500 when Product.create throws error", async () => {
    jwt.verify.mockReturnValue(validUser);

    imagekitService.uploadImage.mockResolvedValue({
      url: "https://imagekit.io/image.jpg",
      fileId: "123",
    });

    Product.create.mockRejectedValue(new Error("DB Error"));

    const res = await request(app)
      .post("/api/products")
      .set("Authorization", "Bearer token")
      .field("title", "iPhone")
      .field("priceAmount", "50000")
      .attach("images", Buffer.from("fake image"), "phone.jpg");

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Internal server error");
  });
});