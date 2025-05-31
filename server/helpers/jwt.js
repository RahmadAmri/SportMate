const jwt = require("jsonwebtoken");

module.exports = {
  generateToken: (payload) => {
    console.log(payload, "<<<ini");

    let token = jwt.sign(payload, "inirahasia");

    return token;
  },
  verifyToken: (token) => {
    return jwt.verify(token, "inirahasia");
  },
};
