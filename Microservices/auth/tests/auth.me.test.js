require("./setup");
const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret_key_123";

describe("GET /api/auth/me", () => {
    let authToken;
    let mockUser;

    beforeEach(async () => {
        const hashedPassword = await bcrypt.hash("password123", 10);
        
        mockUser = await User.create({
            username: "me_user",
            email: "me@example.com",
            password: hashedPassword,
            fullName: {
                firstName: "Me",
                lastName: "User"
            },
            role: "user"
        });

        // Generate a valid JWT token
        authToken = jwt.sign(
            { id: mockUser._id, username: mockUser.username, email: mockUser.email, role: mockUser.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
    });

    it("should successfully return authenticated user profile when cookie is provided", async () => {
        const res = await request(app)
            .get("/api/auth/me")
            .set("Cookie", [`token=${authToken}`]);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("user");
        expect(res.body.user).toHaveProperty("email", mockUser.email);
        expect(res.body.user).not.toHaveProperty("password"); // Password should never be exposed
    });

    it("should fail and return 401 if no authentication token/cookie is provided", async () => {
        const res = await request(app)
            .get("/api/auth/me");

        expect(res.statusCode).toBe(401);
    });

    it("should fail and return 401 if token is invalid or expired", async () => {
        const res = await request(app)
            .get("/api/auth/me")
            .set("Cookie", ["token=invalid_token_xyz"]);

        expect(res.statusCode).toBe(401);
    });
});