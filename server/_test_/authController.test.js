const request = require("supertest");
const app = require("../app");
const { User } = require("../models");
const { generateToken } = require("../helpers/jwt");
const { generatePassword } = require("../helpers/bcrypt");

describe("AuthController", () => {
  beforeEach(async () => {
    await User.destroy({ where: {}, force: true });
  });

  describe("register", () => {
    it("should handle validation errors", async () => {
      const response = await request(app).post("/register").send({
        email: "invalid-email",
        password: "123",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("should handle duplicate email", async () => {
      await User.create({
        userName: "existing",
        email: "existing@test.com",
        password: generatePassword("password123"),
      });

      const response = await request(app).post("/register").send({
        userName: "new",
        email: "existing@test.com",
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Email already registered"
      );
    });
  });

  describe("login", () => {
    it("should handle non-existent user", async () => {
      const response = await request(app).post("/login").send({
        email: "nonexistent@test.com",
        password: "password123",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty(
        "message",
        "Email is not registered"
      );
    });

    it("should handle incorrect password", async () => {
      await User.create({
        userName: "testuser",
        email: "test@test.com",
        password: generatePassword("password123"),
      });

      const response = await request(app).post("/login").send({
        email: "test@test.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid password");
    });
  });

  describe("error handling", () => {
    it("should handle database connection errors during login", async () => {
      const originalFindOne = User.findOne;
      User.findOne = jest
        .fn()
        .mockRejectedValue(new Error("Database connection error"));

      const response = await request(app).post("/login").send({
        email: "test@test.com",
        password: "password123",
      });

      expect(response.status).toBe(500);
      User.findOne = originalFindOne;
    });

    it("should handle validation errors during registration", async () => {
      const response = await request(app).post("/register").send({
        userName: "",
        email: "invalid-email",
        password: "123",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("should handle password hashing errors", async () => {
      const response = await request(app).post("/register").send({
        userName: "test",
        email: "test@test.com",
        password: null,
      });

      expect(response.status).toBe(400);
    });
  });
});
