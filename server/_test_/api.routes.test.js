const request = require("supertest");
const app = require("../app");
const { User, ProgressLog } = require("../models");
const { generateToken } = require("../helpers/jwt");

describe("API Routes", () => {
  let token;
  let userId;

  beforeAll(async () => {
    // Create test user
    const user = await User.create({
      userName: "apitest",
      email: "api@test.com",
      password: "password123",
    });
    userId = user.id;
    token = generateToken({ id: user.id, email: user.email });
  });

  afterAll(async () => {
    await User.destroy({ where: {}, force: true });
    await ProgressLog.destroy({ where: {}, force: true });
  });

  describe("Protected Routes", () => {
    it("should require authentication", async () => {
      const responses = await Promise.all([
        request(app).get("/"),
        request(app).get("/api/protected-route"),
      ]);

      responses.forEach((response) => {
        expect(response.status).toBe(401);
      });
    }, 10000); // Increase timeout

    it("should accept valid authentication", async () => {
      const response = await request(app)
        .get("/")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
    });
  });

  describe("Error Handling", () => {
    it("should handle malformed JSON", async () => {
      const response = await request(app)
        .post("/progressLog")
        .set("Authorization", `Bearer ${token}`)
        .set("Content-Type", "application/json")
        .send('{"malformed":json}');

      expect(response.status).toBe(400);
    });

    it("should handle unsupported methods", async () => {
      const response = await request(app)
        .patch("/")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe("Back Exercises Route", () => {
    beforeEach(() => {
      jest.resetModules();
    });

    it("should return back exercises data", async () => {
      const response = await request(app)
        .get("/api/back-exercises")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it("should handle file read errors", async () => {
      jest.mock(
        "../data/backExercises.json",
        () => {
          throw new Error("File not found");
        },
        { virtual: true }
      );

      const response = await request(app)
        .get("/api/back-exercises")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty(
        "message",
        "Failed to load exercises"
      );
    });
  });
});
