const request = require("supertest");
const app = require("../app");
const { ProgressLog, User, UserPreference, sequelize } = require("../models");

let testUserId;

beforeAll(async () => {
  // Create test user
  const user = await User.create({
    userName: "Test User", // FIX: use userName, not name
    email: "test@example.com",
    password: "password123",
  });
  testUserId = user.id;

  // Create test user preferences
  await UserPreference.create({
    UserId: testUserId,
    preferredSports: "Running",
    fitnessGoal: "Weight Loss",
  });
});

afterAll(async () => {
  // Clean up all test data
  await sequelize.queryInterface.bulkDelete("Users", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
  await sequelize.queryInterface.bulkDelete("UserPreferences", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
  await sequelize.queryInterface.bulkDelete("ProgressLogs", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
});

describe("ProgressLog API", () => {
  describe("GET /", () => {
    it("should return all progress logs", async () => {
      const response = await request(app).get("/");
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should include user data without sensitive information", async () => {
      const response = await request(app).get("/");
      if (response.body.length > 0) {
        expect(response.body[0].User).not.toHaveProperty("password");
        expect(response.body[0].User).not.toHaveProperty("createdAt");
        expect(response.body[0].User).not.toHaveProperty("updatedAt");
      }
    });
  });

  describe("GET /user-preferences/:UserId", () => {
    it("should return user preferences", async () => {
      const response = await request(app).get(
        `/user-preferences/${testUserId}`
      );
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty("preferredSports");
      expect(response.body[0]).toHaveProperty("fitnessGoal");
    });

    it("should return empty array for non-existent user", async () => {
      const response = await request(app).get("/user-preferences/999");
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe("PUT /user-preferences/:UserId", () => {
    it("should update user preferences", async () => {
      const updatedPrefs = {
        preferredSports: "Swimming",
        fitnessGoal: "Muscle Gain",
      };

      const response = await request(app)
        .put(`/user-preferences/${testUserId}`)
        .send(updatedPrefs);

      expect(response.status).toBe(201);
      expect(response.body.updatedPreference).toHaveProperty(
        "preferredSports",
        updatedPrefs.preferredSports
      );
    });

    it("should return 404 for non-existent user", async () => {
      const response = await request(app).put("/user-preferences/999").send({
        preferredSports: "Swimming",
        fitnessGoal: "Muscle Gain",
      });

      expect(response.status).toBe(404);
    });
  });

  describe("POST /progressLog", () => {
    it("should create a new progress log", async () => {
      const newLog = {
        sport: "Running",
        duration: 30,
        caloriesBurned: 300,
        UserId: testUserId,
        tags: "#running, #cardio",
        pricePerSession: 100000,
        description: "Test log",
      };

      const response = await request(app).post("/progressLog").send(newLog);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data).toHaveProperty("sport", newLog.sport);
      expect(response.body.data).toHaveProperty("duration", newLog.duration);
      expect(response.body.data).toHaveProperty(
        "caloriesBurned",
        newLog.caloriesBurned
      );
      expect(response.body.data).toHaveProperty("UserId", testUserId);
    });

    it("should handle invalid input", async () => {
      const invalidLog = {
        sport: "Running",
        // Missing duration, caloriesBurned, UserId, tags, pricePerSession, description
      };

      const response = await request(app).post("/progressLog").send(invalidLog);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");

      // Accept both array and string error message formats
      const messages = Array.isArray(response.body.message)
        ? response.body.message
        : [response.body.message];

      expect(messages).toEqual(
        expect.arrayContaining([
          "duration is required",
          "caloriesBurned is required",
          "UserId is required",
          "tags is required",
          "pricePerSession is required",
          "description is required",
        ])
      );
    });
  });

  describe("DELETE /progressLog/:id", () => {
    it("should delete a progress log", async () => {
      const log = await ProgressLog.create({
        sport: "Swimming",
        duration: 45,
        caloriesBurned: 400,
        UserId: testUserId,
        tags: "#swimming, #cardio",
        pricePerSession: 120000,
        description: "Test log",
      });

      const response = await request(app).delete(`/progressLog/${log.id}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain("Swimming");
    });

    it("should return 404 for non-existent log", async () => {
      const response = await request(app).delete("/progressLog/999");
      expect(response.status).toBe(404);
    });
  });
});
