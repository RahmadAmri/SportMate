const jwt = require("jsonwebtoken");

function signToken(data) {
  return jwt.sign(data, "secret");
}

function verifyToken(token) {
  return jwt.verify(token, "secret");
}
module.exports = { signToken, verifyToken };
