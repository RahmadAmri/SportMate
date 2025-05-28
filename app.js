const express = require("express");
require('dotenv').config();
const app = express();
const PORT = 3000;
const router = require('./routers');

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/', router);

app.listen(PORT, () => {
  console.log(`Example app listening on PORT ${PORT}`);
});

module.exports = app;
