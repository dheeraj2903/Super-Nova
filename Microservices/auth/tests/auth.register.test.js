require("./setup");
const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user.model");

describe("POST /auth/register", () => {

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

        const res = await request(app)
            .post("/auth/register")
            .send(userData);

        // Agar tumhara controller 200 de raha hai toh 200 ya 201 match karega
        expect([200, 201]).toContain(res.statusCode);
        expect(res.body).toHaveProperty("message");

        // DB record verify
        const createdUser = await User.findOne({ email: "dheeraj@example.com" });
        expect(createdUser).not.toBeNull();
        expect(createdUser.username).toBe("dheeraj_v");
    });

    it("should fail registration if required fields are missing", async () => {
        const incompleteData = {
            email: "incomplete@example.com"
        };

        const res = await request(app)
            .post("/auth/register")
            .send(incompleteData);

        expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });
});