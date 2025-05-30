const request = require("supertest");
const app = require("../app");
const { User } = require("../models");
const { generateToken } = require("../helpers/jwt");
const { generatePassword } = require("../helpers/bcrypt");
const axios = require("axios");

jest.mock("axios");

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

    it("should handle duplicate email registration", async () => {
      const userData = {
        userName: "testuser2",
        email: "test@example.com",
        password: "password123",
      };

      const response = await request(app).post("/register").send(userData);
      expect(response.status).toBe(400);
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

    it("should fail with missing email", async () => {
      const response = await request(app).post("/login").send({
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Email is required");
    });

    it("should fail with missing password", async () => {
      const response = await request(app).post("/login").send({
        email: "test@example.com",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Password is required");
    });

    it("should fail with incorrect password", async () => {
      const response = await request(app).post("/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Email or Password invalid");
    });

    it("should fail with non-existent email", async () => {
      const response = await request(app).post("/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Email is not registered");
    });
  });

  describe("POST /google-login", () => {
    it("should handle missing token", async () => {
      const response = await request(app).post("/google-login").send({});
      expect(response.status).toBe(400);
    });

    it("should handle successful Google login", async () => {
      const mockGoogleResponse = {
        data: {
          email: "google@example.com",
          name: "Google User",
        },
      };

      axios.get.mockResolvedValueOnce(mockGoogleResponse);

      const response = await request(app)
        .post("/google-login")
        .send({ google_token: "valid_token" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("email", "google@example.com");
    });

    it("should handle Google API error", async () => {
      axios.get.mockRejectedValueOnce(new Error("API Error"));

      const response = await request(app)
        .post("/google-login")
        .send({ google_token: "invalid_token" });

      expect(response.status).toBe(401);
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
        .get("/")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
    });

    it("should fail with invalid token", async () => {
      const response = await request(app)
        .get("/")
        .set("Authorization", "Bearer invalid_token");

      expect(response.status).toBe(401);
    });

    it("should fail with missing token", async () => {
      const response = await request(app).get("/");
      expect(response.status).toBe(401);
    });
  });
});
