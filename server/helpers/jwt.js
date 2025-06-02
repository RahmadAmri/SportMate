const jwt = require("jsonwebtoken");

module.exports = {
  generateToken: (payload) => {
    console.log(payload, "<<<ini");

    let token = jwt.sign(payload, process.env.JWT_SECRET);

    return token;
  },
  verifyToken: (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
  },
};
