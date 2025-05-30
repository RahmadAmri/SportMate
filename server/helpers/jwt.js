const jwt = require("jsonwebtoken");

module.exports = {
  generateToken: (payload) => {
    let token = jwt.sign(payload, "ini_rahasia");
    return token;
  },
  verifyToken: (token) => {
    return jwt.verify(token, "ini_rahasia");
  },
};
