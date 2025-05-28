const express = require("express");
const app = express();
const PORT = 3000;
const Controller = require("./controllers/controller");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", Controller.getProgressLog);
app.get("/user-preferences/:UserId", Controller.getUserPreferences);
app.put("/user-preferences/:UserId", Controller.updateUserPreferences);
app.post("/progressLog", Controller.createProgressLog);
app.delete("/progressLog/:id", Controller.deleteProgressLog);

app.listen(PORT, () => {
  console.log(`Example app listening on PORT ${PORT}`);
});

module.exports = app;
