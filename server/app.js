if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const Controller = require("./controllers/controller");
const apiRouter = require("./routes/api");
const cors = require("cors");
const AuthController = require("./controllers/authController");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://ip-rahmadamri.web.app"],
    credentials: true,
  })
);

app.use("/login", require("./routers/login"));
app.use("/register", require("./routers/register"));
app.use("/api", apiRouter);
app.post("/google-login", AuthController.googleLogin);

app.get("/", Controller.getProgressLog);
app.get("/user-preferences/:UserId", Controller.getUserPreferences);
app.put("/user-preferences/:UserId", Controller.updateUserPreferences);
app.post("/progressLog", Controller.createProgressLog);
app.put("/progressLog/:id", Controller.updateProgressLog); // Add this line
app.delete("/progressLog/:id", Controller.deleteProgressLog);

const { generateContent } = require("./helpers/gemini.api");
const { ProgressLog } = require("./models");

const userPesona = {
  name: "John Doe",
  age: 30,
  gender: "Male",
  sportPreferences: {
    highlyCaloriesBurned: true,
  },
};

async function buildPrompt() {
  const dataSport = await ProgressLog.findAll({
    raw: true,
  });
  return `
    I want you to recommend the user with best sports for burning lots of fat,
    recommend me

    from the list below:
    ${dataSport
      .map((element) => `- ${element.caloriesBurned} (ID: ${element.id})`)
      .join("\n")}

    based on the following criteria:
    - Highly calories burned
    Response with Array of ID
    `;
}

app.get("/prompt", async (req, res) => {
  console.log("Received request with user persona:", userPesona);

  const prompt2 = await buildPrompt();
  console.log("Prompt for generation:", prompt2);

  const generation = await generateContent(prompt2);

  const parsedOutput = JSON.parse(generation);

  console.log("Generation:", parsedOutput);

  const sport = await ProgressLog.findAll({
    where: {
      id: parsedOutput,
    },
  });

  res.json({
    message: "Hello from Gemini API",
    generation: parsedOutput,
    sport,
  });
});

app.listen(PORT, () => {
  console.log(`Example app listening on PORT ${PORT}`);
});

module.exports = app;
