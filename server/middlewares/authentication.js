const { verifyToken } = require("../helpers/jwt");
const { User } = require("../models");

async function authentication(req, _res, next) {
  try {
    const bearToken = req.headers.authorization;

    if (!bearToken) {
      throw { name: "Unauthorized", message: "Invalid token" };
    }
    const [type, token] = bearToken.split(" ");
    if (type !== "Bearer") {
      throw { name: "Unauthorized", message: "Invalid token" };
    }
    const data = verifyToken(token);
    const user = await User.findByPk(data.id);
    if (!user) {
      throw { name: "JsonWebTokenError", message: "invalid id" };
    }
    req.user = user;
    console.log("auth succes for user: ", user);
    next();
  } catch (error) {
    console.error("auth failed: ", error);
    next(error);
  }
}

module.exports = authentication;
