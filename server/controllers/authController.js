const { comparePassword, generatePassword } = require("../helpers/bcrypt");
const { User } = require("../models/index");
const { generateToken } = require("../helpers/jwt");
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
        email: user.email,
        userName: user.userName,
      });
    } catch (error) {
      next(error);
    }
  }

  static async googleLogin(req, res, next) {
    try {
      const { google_token } = req.headers;
      
      if (!google_token) {
        throw {
          name: "AuthenticationError",
          message: "Google token is required"
        };
      }

      try {
        const ticket = await client.verifyIdToken({
          idToken: google_token,
          audience: process.env.GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        
        if (!payload) {
          throw {
            name: "AuthenticationError",
            message: "Invalid Google token"
          };
        }

        const [user, created] = await User.findOrCreate({
          where: { email: payload.email },
          defaults: {
            userName: payload.name || payload.email.split('@')[0],
            email: payload.email,
            password: generatePassword(process.env.GOOGLE_PASSWORD_SECRET + payload.email)
          }
        });

        const tokenPayload = {
          id: user.id,
          email: user.email,
          userName: user.userName
        };

        const token = generateToken(tokenPayload);

        res.status(200).json({
          id: user.id,
          token: token,
          email: user.email,
          userName: user.userName
        });
      } catch (verifyError) {
        throw {
          name: "AuthenticationError",
          message: "Failed to verify Google token"
        };
      }
    } catch (error) {
      console.error('Google Login Error:', error);
      next(error);
    }
  }
};
