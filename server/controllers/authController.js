const { comparePassword, generatePassword } = require("../helpers/bcrypt");
const { User } = require("../models/index");
const { generateToken } = require("../helpers/jwt");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

module.exports = class AuthController {
  static async register(req, res, next) {
    try {
      console.log(req.body, "<<<ini regisa");

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
      console.log(user, "<<<ini user");

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
      console.log(payload, "<<<payyy");

      const token = generateToken(payload);

      res.status(200).json({
        id: user.id,
        token: token,
        email: user.email,
        userName: user.userName,
      });
    } catch (error) {
      next(error);
    }
  }

  static async googleLogin(req, res, next) {
    try {
      const { google_token } = req.body;

      if (!google_token) {
        return res.status(400).json({
          message: "Google token is required",
        });
      }

      try {
        const response = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${google_token}`,
            },
          }
        );

        const { email, name } = response.data;

        const [user, created] = await User.findOrCreate({
          where: { email },
          defaults: {
            userName: name || email.split("@")[0],
            email,
            password: generatePassword(
              process.env.GOOGLE_PASSWORD_SECRET + email
            ),
          },
        });

        const token = generateToken({
          id: user.id,
          email: user.email,
          userName: user.userName,
        });

        return res.status(200).json({
          id: user.id,
          token,
          email: user.email,
          userName: user.userName,
        });
      } catch (verifyError) {
        console.error("Token verification error:", verifyError);
        return res.status(401).json({
          message: "Failed to verify Google token",
        });
      }
    } catch (error) {
      console.error("Google Login Error:", error);
      return res.status(500).json({
        message: "Internal server error during Google login",
      });
    }
  }
};
