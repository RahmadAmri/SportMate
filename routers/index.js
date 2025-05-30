const express = require("express");
const { generateContent } = require("../helpers/gemini.api.js");
const app = express();
const { ProgressLog } = require("../models");

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
    attributes: ["id", "caloriesBurned"],
    raw: true,
  });
  return `
    I want you to recommend the user with best sports for burning lots of fat,
    recommend me only two datas

    from the list below:
    ${dataSport
      .map((element) => `- ${element.caloriesBurned} (ID: ${element.id})`)
      .join("\n")}

    based on the following criteria:
    - Highly calories burned
    Response with Array of ID
    `;
}

app.get("/", async (req, res) => {
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

app.listen(3005, () => console.log("Server running on port 3005"));
