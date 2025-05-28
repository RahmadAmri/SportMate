const express = require("express");
const app = express();
const PORT = 3000;
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.listen(PORT, () => {
  console.log(`Example app listening on PORT ${PORT}`);
});

module.exports = app;
