require("./setup");
const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user.model");
const bcrypt = require("bcryptjs");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret_key_123";

describe("POST /api/auth/login", () => {
    const mockUser = {
        username: "login_user",
        email: "login@example.com",
        password: "password123",
        fullName: {
            firstName: "Login",
            lastName: "Tester"
        }
    };

    beforeEach(async () => {
        const hashedPassword = await bcrypt.hash(mockUser.password, 10);
        await User.create({
            ...mockUser,
            password: hashedPassword
        });
    });

    it("should successfully log in with valid credentials and return a token cookie", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: mockUser.email,
                password: mockUser.password
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message");
        
        const cookies = res.headers["set-cookie"];
        expect(cookies).toBeDefined();
        expect(cookies[0]).toMatch(/token=/);
    });

    it("should fail login with incorrect password", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: mockUser.email,
                password: "wrongpassword"
            });

        expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });

    it("should fail login if the user does not exist", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: "nonexistent@example.com",
                password: mockUser.password
            });

        expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });
});