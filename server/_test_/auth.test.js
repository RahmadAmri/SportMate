const request = require("supertest");
const app = require("../app");
const { User } = require("../models");
const { generateToken } = require("../helpers/jwt");
const { generatePassword } = require("../helpers/bcrypt");

describe("Authentication", () => {
  beforeAll(async () => {
    await User.destroy({ truncate: true, cascade: true });
  });

  afterAll(async () => {
    await User.destroy({ truncate: true, cascade: true });
  });

  describe("POST /register", () => {
    it("should create a new user", async () => {
      const userData = {
        userName: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      const response = await request(app).post("/register").send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("userName", userData.userName);
      expect(response.body).toHaveProperty("email", userData.email);
      expect(response.body).not.toHaveProperty("password");
    });

    it("should handle duplicate email", async () => {
      const userData = {
        userName: "testuser2",
        email: "test@example.com",
        password: "password123",
      };

      const response = await request(app).post("/register").send(userData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("should handle missing required fields", async () => {
      const response = await request(app).post("/register").send({
        email: "test@example.com",
        // missing userName and password
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("POST /login", () => {
    it("should login successfully with correct credentials", async () => {
      const response = await request(app).post("/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("email");
    });

    it("should handle invalid credentials", async () => {
      const response = await request(app).post("/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");
    });

    it("should handle missing email", async () => {
      const response = await request(app).post("/login").send({
        password: "password123",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Email is required");
    });

    it("should handle missing password", async () => {
      const response = await request(app).post("/login").send({
        email: "test@example.com",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Password is required");
    });

    it("should handle non-existent email", async () => {
      const response = await request(app).post("/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "message",
        "Email is not registered"
      );
    });
  });

  describe("POST /google-login", () => {
    it("should handle missing token", async () => {
      const response = await request(app).post("/google-login").send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Google token is required"
      );
    });

    it("should handle invalid token", async () => {
      const response = await request(app)
        .post("/google-login")
        .send({ google_token: "invalid_token" });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("Authentication Middleware", () => {
    let token;

    beforeAll(async () => {
      const user = await User.create({
        userName: "testuser",
        email: "middleware@test.com",
        password: generatePassword("password123"),
      });
      token = generateToken({ id: user.id, email: user.email });
    });

    it("should pass authentication with valid token", async () => {
      const response = await request(app)
        .get("/protected-route")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).not.toBe(401);
    });

    it("should fail authentication with invalid token", async () => {
      const response = await request(app)
        .get("/protected-route")
        .set("Authorization", "Bearer invalid_token");

      expect(response.status).toBe(401);
    });

    it("should fail authentication with missing token", async () => {
      const response = await request(app).get("/protected-route");

      expect(response.status).toBe(401);
    });
  });

  describe("Password Reset", () => {
    it("should initiate password reset", async () => {
      const response = await request(app)
        .post("/forgot-password")
        .send({ email: "test@example.com" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "Password reset email sent");
    });

    it("should handle non-existent email for password reset", async () => {
      const response = await request(app)
        .post("/forgot-password")
        .send({ email: "nonexistent@example.com" });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Email not found");
    });
  });
});
