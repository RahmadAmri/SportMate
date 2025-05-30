const request = require("supertest");
const app = require("../app");
const { User } = require("../models");
const { generateToken } = require("../helpers/jwt");

describe("Error Handler Middleware", () => {
  it("should handle validation errors", async () => {
    const response = await request(app)
      .post("/register")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
  });

  it("should handle unauthorized access", async () => {
    const response = await request(app)
      .get("/protected-route");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Authentication required");
  });

  it("should handle not found routes", async () => {
    const response = await request(app)
      .get("/non-existent-route");

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Route not found");
  });
});

describe("Authentication Middleware", () => {
  let validToken;

  beforeAll(async () => {
    const user = await User.create({
      userName: "middleware_test",
      email: "middleware@test.com",
      password: "password123"
    });
    validToken = generateToken({ id: user.id, email: user.email });
  });

  afterAll(async () => {
    await User.destroy({ where: { email: "middleware@test.com" } });
  });

  it("should allow access with valid token", async () => {
    const response = await request(app)
      .get("/protected-route")
      .set("Authorization", `Bearer ${validToken}`);

    expect(response.status).not.toBe(401);
  });

  it("should reject invalid token format", async () => {
    const response = await request(app)
      .get("/protected-route")
      .set("Authorization", "InvalidFormat");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Invalid token format");
  });

  it("should reject expired token", async () => {
    const expiredToken = generateToken({ id: 1, email: "test@test.com" }, '0s');
    
    const response = await request(app)
      .get("/protected-route")
      .set("Authorization", `Bearer ${expiredToken}`);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Token expired");
  });

  it("should reject malformed token", async () => {
    const response = await request(app)
      .get("/protected-route")
      .set("Authorization", "Bearer malformed.token.here");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Invalid token");
  });

  it("should handle missing Authorization header", async () => {
    const response = await request(app)
      .get("/protected-route")
      .set("Authorization", "");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Authentication required");
  });
});

describe("Error Handling", () => {
  it("should handle database connection errors", async () => {
    // Temporarily break database connection
    const originalQuery = User.findOne;
    User.findOne = jest.fn().mockRejectedValue(new Error("Database error"));

    const response = await request(app)
      .post("/login")
      .send({
        email: "test@test.com",
        password: "password123"
      });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("message");

    // Restore original function
    User.findOne = originalQuery;
  });

  it("should handle validation middleware errors", async () => {
    const response = await request(app)
      .post("/register")
      .send({
        email: "invalid-email",
        password: "123" // too short
      });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
  });
});