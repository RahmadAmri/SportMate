const request = require("supertest");
const app = require("../app");
const { User } = require("../models");
const { generateToken } = require("../helpers/jwt");
const { generatePassword } = require("../helpers/bcrypt");
const axios = require("axios");

jest.mock("axios");

describe("AuthController", () => {
  beforeEach(async () => {
    await User.destroy({ truncate: true, cascade: true });
  });

  afterAll(async () => {
    await User.destroy({ truncate: true, cascade: true });
  });

  describe("register", () => {
    it("should handle validation errors", async () => {
      const response = await request(app).post("/register").send({
        email: "invalid-email",
        password: "123",
      });

      expect(response.status).toBe(400);
    });

    it("should create a new user with valid data", async () => {
      const userData = {
        userName: "testuser",
        email: "test@example.com",
        password: "password123",
      };

      const response = await request(app).post("/register").send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("userName", userData.userName);
    });

    it("should handle database errors", async () => {
      const originalCreate = User.create;
      User.create = jest.fn().mockRejectedValue(new Error("Database error"));

      const response = await request(app).post("/register").send({
        userName: "testuser",
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(500);
      User.create = originalCreate;
    });
  });

  describe("login", () => {
    beforeEach(async () => {
      await User.create({
        userName: "testuser",
        email: "test@example.com",
        password: generatePassword("password123"),
      });
    });

    it("should login successfully with correct credentials", async () => {
      const response = await request(app).post("/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
    });

    it("should handle missing email", async () => {
      const response = await request(app).post("/login").send({
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Email is required");
    });

    it("should handle missing password", async () => {
      const response = await request(app).post("/login").send({
        email: "test@example.com",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Password is required");
    });

    it("should handle non-existent user", async () => {
      const response = await request(app).post("/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Email is not registered");
    });

    it("should handle incorrect password", async () => {
      const response = await request(app).post("/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Email or Password invalid");
    });

    it("should handle database errors", async () => {
      const originalFindOne = User.findOne;
      User.findOne = jest.fn().mockRejectedValue(new Error("Database error"));

      const response = await request(app).post("/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(500);
      User.findOne = originalFindOne;
    });
  });

  describe("googleLogin", () => {
    it("should handle missing token", async () => {
      const response = await request(app).post("/google-login").send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Google token is required");
    });

    it("should handle successful login with new user", async () => {
      const googleData = {
        email: "google@example.com",
        name: "Google User",
      };

      axios.get.mockResolvedValueOnce({ data: googleData });

      const response = await request(app)
        .post("/google-login")
        .send({ google_token: "valid_token" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("email", googleData.email);
    });

    it("should handle successful login with existing user", async () => {
      await User.create({
        userName: "existinguser",
        email: "google@example.com",
        password: generatePassword("somepassword"),
      });

      axios.get.mockResolvedValueOnce({
        data: {
          email: "google@example.com",
          name: "Existing User",
        },
      });

      const response = await request(app)
        .post("/google-login")
        .send({ google_token: "valid_token" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
    });

    it("should handle Google API error", async () => {
      axios.get.mockRejectedValueOnce(new Error("API Error"));

      const response = await request(app)
        .post("/google-login")
        .send({ google_token: "invalid_token" });

      expect(response.status).toBe(401);
    });

    it("should handle database errors during user creation", async () => {
      axios.get.mockResolvedValueOnce({
        data: {
          email: "google@example.com",
          name: "Google User",
        },
      });

      const originalFindOrCreate = User.findOrCreate;
      User.findOrCreate = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/google-login")
        .send({ google_token: "valid_token" });

      expect(response.status).toBe(500);
      User.findOrCreate = originalFindOrCreate;
    });
  });
});
