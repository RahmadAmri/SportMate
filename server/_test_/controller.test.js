const request = require("supertest");
const app = require("../app");
const { User, ProgressLog, UserPreference } = require("../models");
const { generateToken } = require("../helpers/jwt");

describe("Controller Tests", () => {
  let token;
  let userId;

  beforeAll(async () => {
    const user = await User.create({
      userName: "testuser",
      email: "controller@test.com",
      password: "password123",
    });
    userId = user.id;
    token = generateToken({ id: user.id, email: user.email });
  });

  afterAll(async () => {
    await User.destroy({
      where: { email: "controller@test.com" },
      force: true,
    });
  });

  describe("getProgressLog", () => {
    beforeEach(async () => {
      await ProgressLog.destroy({ where: {}, force: true });
    });

    it("should return all progress logs", async () => {
      await ProgressLog.create({
        sport: "Running",
        duration: 30,
        caloriesBurned: 300,
        UserId: userId,
        tags: "#running",
        pricePerSession: 0,
        description: "Test log",
      });

      const response = await request(app)
        .get("/")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it("should handle database errors", async () => {
      const originalFindAll = ProgressLog.findAll;
      ProgressLog.findAll = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .get("/")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message");

      ProgressLog.findAll = originalFindAll;
    });
  });

  describe("getUserPreferences", () => {
    it("should return user preferences", async () => {
      await UserPreference.create({
        UserId: userId,
        preferredSports: "Running",
        fitnessGoal: "Weight loss",
      });

      const response = await request(app)
        .get(`/user-preferences/${userId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty("preferredSports");
    });

    it("should handle database errors", async () => {
      const originalFindAll = UserPreference.findAll;
      UserPreference.findAll = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .get(`/user-preferences/${userId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message");

      UserPreference.findAll = originalFindAll;
    });
  });

  describe("updateUserPreferences", () => {
    it("should update user preferences", async () => {
      const preferences = {
        preferredSports: "Swimming",
        fitnessGoal: "Muscle gain",
      };

      const response = await request(app)
        .put(`/user-preferences/${userId}`)
        .set("Authorization", `Bearer ${token}`)
        .send(preferences);

      expect(response.status).toBe(201);
      expect(response.body.updatedPreference).toHaveProperty(
        "preferredSports",
        preferences.preferredSports
      );
    });

    it("should handle non-existent user", async () => {
      const response = await request(app)
        .put("/user-preferences/999999")
        .set("Authorization", `Bearer ${token}`)
        .send({
          preferredSports: "Running",
          fitnessGoal: "Weight loss",
        });

      expect(response.status).toBe(404);
    });
  });

  describe("createProgressLog", () => {
    it("should validate required fields", async () => {
      const response = await request(app)
        .post("/progressLog")
        .set("Authorization", `Bearer ${token}`)
        .send({
          sport: "Running",
          // Missing other required fields
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("should handle invalid data types", async () => {
      const response = await request(app)
        .post("/progressLog")
        .set("Authorization", `Bearer ${token}`)
        .send({
          sport: "Running",
          duration: "invalid",
          caloriesBurned: "invalid",
          tags: "#running",
          pricePerSession: "invalid",
          UserId: userId,
          description: "Test",
        });

      expect(response.status).toBe(400);
    });
  });

  describe("deleteProgressLog", () => {
    it("should handle non-existent log", async () => {
      const response = await request(app)
        .delete("/progressLog/999999")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });
});
