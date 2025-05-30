const request = require("supertest");
const app = require("../app");
const { User, ProgressLog } = require("../models");
const { generateToken } = require("../helpers/jwt");
const axios = require("axios");

jest.mock("axios");

describe("API Routes", () => {
  let token;
  let userId;

  beforeAll(async () => {
    await User.destroy({ truncate: true, cascade: true });
    await ProgressLog.destroy({ truncate: true, cascade: true });

    const user = await User.create({
      userName: "apitest",
      email: "api@test.com",
      password: "password123",
    });
    userId = user.id;
    token = generateToken({ id: user.id, email: user.email });
  });

  afterAll(async () => {
    await User.destroy({ truncate: true, cascade: true });
    await ProgressLog.destroy({ truncate: true, cascade: true });
  });

  describe("GET /api/back-exercises", () => {
    it("should return exercises data successfully", async () => {
      const mockExercises = [
        { id: 1, name: "Pull-up" },
        { id: 2, name: "Row" },
      ];

      axios.get.mockResolvedValueOnce({ data: mockExercises });

      const response = await request(app)
        .get("/api/back-exercises")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockExercises);
    });

    it("should handle API error", async () => {
      axios.get.mockRejectedValueOnce(new Error("API Error"));

      const response = await request(app)
        .get("/api/back-exercises")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(500);
    });

    it("should handle missing or invalid API key", async () => {
      axios.get.mockRejectedValueOnce({
        response: {
          status: 401,
          data: { message: "Invalid API key" },
        },
      });

      const response = await request(app)
        .get("/api/back-exercises")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(500);
    });
  });

  describe("Protected Routes", () => {
    it("should require authentication", async () => {
      const responses = await Promise.all([
        request(app).get("/api/back-exercises"),
        request(app).get("/prompt"),
        request(app).get(`/user-preferences/${userId}`),
        request(app).post("/progressLog"),
        request(app).put(`/user-preferences/${userId}`),
        request(app).delete("/progressLog/1"),
      ]);

      responses.forEach((response) => {
        expect(response.status).toBe(401);
      });
    });

    it("should accept valid authentication", async () => {
      const mockExercises = [{ id: 1, name: "Pull-up" }];
      axios.get.mockResolvedValueOnce({ data: mockExercises });

      const response = await request(app)
        .get("/api/back-exercises")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
    });

    it("should reject invalid token", async () => {
      const response = await request(app)
        .get("/api/back-exercises")
        .set("Authorization", "Bearer invalid.token.here");

      expect(response.status).toBe(401);
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
        .patch("/api/back-exercises")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it("should handle rate limiting", async () => {
      axios.get.mockRejectedValueOnce({
        response: {
          status: 429,
          data: { message: "Too many requests" },
        },
      });

      const response = await request(app)
        .get("/api/back-exercises")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(500);
    });
  });
});
