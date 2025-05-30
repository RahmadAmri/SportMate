const request = require("supertest");
const app = require("../app");
const { User } = require("../models");
const { generateToken } = require("../helpers/jwt");

describe("Authentication Middleware", () => {
  let validToken;

  beforeAll(async () => {
    const user = await User.create({
      userName: "middleware_test",
      email: "middleware@test.com",
      password: "password123",
    });
    validToken = generateToken({ id: user.id, email: user.email });
  });

  afterAll(async () => {
    await User.destroy({ where: { email: "middleware@test.com" } });
  });

  it("should allow access with valid token", async () => {
    const response = await request(app)
      .get("/")
      .set("Authorization", `Bearer ${validToken}`);

    expect(response.status).toBe(200);
  });

  it("should handle missing Authorization header", async () => {
    const response = await request(app).get("/").set("Authorization", "");

    expect(response.status).toBe(200);
  });
});
