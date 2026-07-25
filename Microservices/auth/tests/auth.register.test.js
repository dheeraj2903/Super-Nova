require("./setup");
const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user.model");

// Set dummy JWT secret for testing environment
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret_key_123";

describe("POST /api/auth/register", () => {

    it("should successfully register a new user", async () => {
        const userData = {
            username: "dheeraj_v",
            email: "dheeraj@example.com",
            password: "password123",
            fullName: {
                firstName: "Dheeraj",
                lastName: "Verma"
            },
            role: "user"
        };

        // CHANGE HERE: /api/auth/register (added /api)
        const res = await request(app)
            .post("/api/auth/register") 
            .send(userData);

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("message", "User registered successfully");
        expect(res.body).toHaveProperty("user");

        // DB record verify
        const createdUser = await User.findOne({ email: "dheeraj@example.com" });
        expect(createdUser).not.toBeNull();
        expect(createdUser.username).toBe("dheeraj_v");
    });

    it("should fail registration if required fields are missing", async () => {
        const incompleteData = {
            email: "incomplete@example.com"
        };

        // CHANGE HERE: /api/auth/register (added /api)
        const res = await request(app)
            .post("/api/auth/register")
            .send(incompleteData);

        expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });
});