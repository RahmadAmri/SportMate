const request = require("supertest");
const app = require("../app");
const { User, ProgressLog, UserPreference } = require("../models");
const { generateToken } = require("../helpers/jwt");

describe("Controller Tests", () => {
  let token;
  let userId;
  let logId;

  beforeAll(async () => {
    await User.destroy({ truncate: true, cascade: true });
    await ProgressLog.destroy({ truncate: true, cascade: true });
    await UserPreference.destroy({ truncate: true, cascade: true });

    const user = await User.create({
      userName: "testuser",
      email: "test@example.com",
      password: "hashedpassword123",
    });
    userId = user.id;
    token = generateToken({ id: user.id, email: user.email });

    const log = await ProgressLog.create({
      sport: "Running",
      duration: 30,
      caloriesBurned: 300,
      UserId: userId,
      tags: ["#running"],
      pricePerSession: 0,
      description: "Test log",
    });
    logId = log.id;

    await UserPreference.create({
      UserId: userId,
      preferredSports: ["running"],
      fitnessGoal: "weight loss",
    });
  });

  afterAll(async () => {
    await User.destroy({ truncate: true, cascade: true });
    await ProgressLog.destroy({ truncate: true, cascade: true });
    await UserPreference.destroy({ truncate: true, cascade: true });
  });

  describe("Progress Log Operations", () => {
    describe("GET /progress-log", () => {
      it("should get all progress logs", async () => {
        const response = await request(app)
          .get("/progress-log")
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
          .get("/progress-log")
          .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(500);
        ProgressLog.findAll = originalFindAll;
      });
    });

    describe("POST /progress-log", () => {
      it("should create a new progress log", async () => {
        const newLog = {
          sport: "Running",
          duration: 30,
          caloriesBurned: 300,
          tags: ["#running"],
          pricePerSession: 0,
          description: "New test log",
          UserId: userId,
        };

        const response = await request(app)
          .post("/progress-log")
          .set("Authorization", `Bearer ${token}`)
          .send(newLog);

        expect(response.status).toBe(201);
        expect(response.body.data).toHaveProperty("sport", newLog.sport);
      });

      it("should handle validation errors", async () => {
        const response = await request(app)
          .post("/progress-log")
          .set("Authorization", `Bearer ${token}`)
          .send({});

        expect(response.status).toBe(400);
      });
    });

    describe("PUT /progress-log/:id", () => {
      it("should update a progress log", async () => {
        const updateData = {
          sport: "Updated Running",
          duration: 45,
          caloriesBurned: 450,
          tags: ["#running", "#cardio"],
          pricePerSession: 10,
          description: "Updated log",
        };

        const response = await request(app)
          .put(`/progress-log/${logId}`)
          .set("Authorization", `Bearer ${token}`)
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body.data.sport).toBe(updateData.sport);
      });

      it("should handle non-existent log", async () => {
        const response = await request(app)
          .put("/progress-log/999999")
          .set("Authorization", `Bearer ${token}`)
          .send({
            sport: "Running",
            duration: 30,
            caloriesBurned: 300,
            tags: ["#running"],
            pricePerSession: 0,
            description: "Test log",
          });

        expect(response.status).toBe(404);
      });
    });

    describe("DELETE /progress-log/:id", () => {
      it("should delete a progress log", async () => {
        const response = await request(app)
          .delete(`/progress-log/${logId}`)
          .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
      });

      it("should handle non-existent log", async () => {
        const response = await request(app)
          .delete("/progress-log/999999")
          .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(404);
      });
    });
  });

  describe("User Preferences Operations", () => {
    describe("GET /preferences/:UserId", () => {
      it("should get user preferences", async () => {
        const response = await request(app)
          .get(`/preferences/${userId}`)
          .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
      });

      it("should handle database errors", async () => {
        const originalFindAll = UserPreference.findAll;
        UserPreference.findAll = jest
          .fn()
          .mockRejectedValue(new Error("Database error"));

        const response = await request(app)
          .get(`/preferences/${userId}`)
          .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(500);
        UserPreference.findAll = originalFindAll;
      });
    });

    describe("PUT /preferences/:UserId", () => {
      it("should update user preferences", async () => {
        const updateData = {
          preferredSports: ["running", "swimming"],
          fitnessGoal: "muscle gain",
        };

        const response = await request(app)
          .put(`/preferences/${userId}`)
          .set("Authorization", `Bearer ${token}`)
          .send(updateData);

        expect(response.status).toBe(201);
        expect(response.body.updatedPreference).toHaveProperty(
          "preferredSports"
        );
      });

      it("should handle non-existent user", async () => {
        const response = await request(app)
          .put("/preferences/999999")
          .set("Authorization", `Bearer ${token}`)
          .send({
            preferredSports: ["running"],
            fitnessGoal: "weight loss",
          });

        expect(response.status).toBe(404);
      });

      it("should handle database errors", async () => {
        const originalUpdate = UserPreference.update;
        UserPreference.update = jest
          .fn()
          .mockRejectedValue(new Error("Database error"));

        const response = await request(app)
          .put(`/preferences/${userId}`)
          .set("Authorization", `Bearer ${token}`)
          .send({
            preferredSports: ["running"],
            fitnessGoal: "weight loss",
          });

        expect(response.status).toBe(500);
        UserPreference.update = originalUpdate;
      });
    });
  });
});
