const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/back-exercises", async (req, res, next) => {
  try {
    const { data } = await axios.get(
      "https://exercisedb.p.rapidapi.com/exercises/bodyPart/back",
      {
        headers: {
          "x-rapidapi-key":
            "0c79c96208msh9725ea4ac6e4135p15b915jsn0d3611e39830",
          "x-rapidapi-host": "exercisedb.p.rapidapi.com",
        },
      }
    );
    res.json(data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
