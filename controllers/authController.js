const { comparePassword, generatePassword } = require("../helpers/bcrypt");
const { User } = require("../models/index");
const { generateToken } = require("../helpers/jwt");

module.exports = class AuthController {
  static async register(req, res, next) {
    try {
      const data = await User.create({
        userName: req.body.userName,
        email: req.body.email,
        password: generatePassword(req.body.password),
      });
      res.status(201).json({
        userName: data.userName,
        email: data.email,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email) {
        throw {
          name: "errorLogin",
          message: "Email is required",
        };
      }

      if (!password) {
        throw {
          name: "errorLogin",
          message: "Password is required",
        };
      }

      const user = await User.findOne({
        where: {
          email: email,
        },
      });

      if (!user) {
        throw {
          name: "errorLogin",
          message: "Email is not registered",
        };
      }

      const passwordIsCorrect = comparePassword(password, user.password);

      if (!passwordIsCorrect) {
        throw {
          name: "errorPassword",
          message: "Email or Password invalid",
        };
      }

      const payload = {
        id: user.id,
        email: user.email,
        userName: user.userName,
      };
      const token = generateToken(payload);

      res.status(200).json({
        id: user.id,
        token: token,
        role: user.role,
      });
    } catch (error) {
      next(error);
    }
  }
};
