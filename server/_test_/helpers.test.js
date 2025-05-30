const { generateToken, verifyToken } = require("../helpers/jwt");
const { generatePassword, comparePassword } = require("../helpers/bcrypt");

jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn().mockImplementation(async (params) => {
        if (!params.contents) {
          throw new Error("Invalid prompt provided");
        }
        if (params.contents === "timeout_test") {
          throw { response: { status: 503 } };
        }
        return {
          text: JSON.stringify([1, 2, 3, 4, 5]),
        };
      }),
    },
  })),
  Type: {
    ARRAY: "array",
    INTEGER: "integer",
    STRING: "string",
    OBJECT: "object",
  },
}));

describe("JWT Helper", () => {
  it("should generate and verify token", () => {
    const payload = { id: 1, email: "test@example.com" };
    const token = generateToken(payload);

    expect(typeof token).toBe("string");

    const decoded = verifyToken(token);
    expect(decoded).toHaveProperty("id", payload.id);
    expect(decoded).toHaveProperty("email", payload.email);
  });

  it("should throw error for invalid token", () => {
    expect(() => verifyToken("invalid_token")).toThrow();
  });
});

describe("Bcrypt Helper", () => {
  it("should hash password and compare correctly", () => {
    const password = "testpassword";
    const hashedPassword = generatePassword(password);

    expect(hashedPassword).not.toBe(password);
    expect(comparePassword(password, hashedPassword)).toBe(true);
    expect(comparePassword("wrongpassword", hashedPassword)).toBe(false);
  });
});

describe("Gemini API Helper", () => {
  const { generateContent } = require("../helpers/gemini.api");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should generate content", async () => {
    const result = await generateContent("test prompt");
    expect(JSON.parse(result)).toEqual([1, 2, 3, 4, 5]);
  });

  it("should handle empty prompt", async () => {
    await expect(generateContent("")).resolves.toEqual("[1,2,3,4,5]");
  });

  it("should handle service unavailable", async () => {
    await expect(generateContent("timeout_test")).rejects.toThrow(
      "Service Unavailable: Please try again later."
    );
  });

  it("should handle general errors", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {}); // Suppress console.error
    const mockError = new Error("Test error");
    jest.spyOn(global, "Error").mockImplementation(() => mockError);

    await expect(generateContent(null)).rejects.toThrow();
  });
});
