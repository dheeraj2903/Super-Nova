require("./setup");
const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// FIX: Redis client ko mock kar do taaki timeout na ho

jest.mock("../src/db/redis.js", () => ({
    set: jest.fn().mockResolvedValue("OK"),
    get: jest.fn().mockResolvedValue(null)
}));

process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret_key_123";

describe("GET /api/auth/logout", () => {
    let authToken;

    beforeEach(async () => {
        const hashedPassword = await bcrypt.hash("password123", 10);
        
        const mockUser = await User.create({
            username: "logout_user",
            email: "logout@example.com",
            password: hashedPassword,
            fullName: {
                firstName: "Logout",
                lastName: "User"
            },
            role: "user"
        });

        authToken = jwt.sign(
            { id: mockUser._id, username: mockUser.username, email: mockUser.email, role: mockUser.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
    });

    it("should successfully log out the user and clear the token cookie", async () => {
        const res = await request(app)
            .get("/api/auth/logout")
            .set("Cookie", [`token=${authToken}`]);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Logged out successfully");

        const cookies = res.headers["set-cookie"];
        expect(cookies).toBeDefined();
        
        const tokenCookie = cookies.find(c => c.startsWith("token="));
        expect(tokenCookie).toBeDefined();
    });

    it("should handle logout gracefully even if no auth token/cookie was provided", async () => {
        const res = await request(app)
            .get("/api/auth/logout");

        expect(res.statusCode).toBe(200);
    });
});