const { ProgressLog, UserPreference, User } = require("../models/index");

class Controller {
  static async getProgressLog(req, res, next) {
    try {
      const data = await ProgressLog.findAll({
        attributes: { exclude: ["createdAt", "updatedAt"] },
        include: [
          {
            model: User,
            attributes: { exclude: ["password", "createdAt", "updatedAt"] },
          },
        ],
      });

      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  static async getUserPreferences(req, res, next) {
    try {
      const { UserId } = req.params;
      const preferences = await UserPreference.findAll({
        where: { UserId },
        attributes: ["preferredSports", "fitnessGoal"],
      });
      res.status(200).json(preferences);
    } catch (error) {
      next(error);
    }
  }
  static async updateUserPreferences(req, res, next) {
    try {
      const { UserId } = req.params;
      const { preferredSports, fitnessGoal } = req.body;

      const [updated] = await UserPreference.update(
        { preferredSports, fitnessGoal },
        { where: { UserId } }
      );

      if (updated) {
        const updatedPreference = await UserPreference.findOne({
          where: { UserId },
        });
        res.status(201).json({
          message: `User preferences ${preferredSports} updated successfully`,
          updatedPreference,
        });
      } else {
        res.status(404).json({ message: "User preferences not found" });
      }
    } catch (error) {
      next(error);
    }
  }
  static async createProgressLog(req, res, next) {
    try {
      const {
        sport,
        duration,
        caloriesBurned,
        tags,
        pricePerSession,
        UserId,
        description,
      } = req.body;

      const requiredFields = [
        "sport",
        "duration",
        "caloriesBurned",
        "tags",
        "pricePerSession",
        "UserId",
        "description",
      ];
      const missingFields = requiredFields.filter((field) => !req.body[field]);

      if (missingFields.length > 0) {
        return res.status(400).json({
          message: missingFields.map((field) => `${field} is required`),
        });
      }

      const newLog = await ProgressLog.create({
        sport,
        duration: +duration,
        caloriesBurned: +caloriesBurned,
        tags,
        pricePerSession: +pricePerSession,
        UserId,
        description,
      });

      const logWithUser = await ProgressLog.findByPk(newLog.id, {
        attributes: { exclude: ["createdAt", "updatedAt"] },
        include: [
          {
            model: User,
            attributes: { exclude: ["password", "createdAt", "updatedAt"] },
          },
        ],
      });

      res.status(201).json({
        message: `Progress log with name ${sport} successfully added`,
        data: logWithUser,
      });
    } catch (error) {
      next(error);
    }
  }
  static async deleteProgressLog(req, res, next) {
    try {
      const { id } = req.params;
      const findLog = await ProgressLog.findByPk(id, {
        attributes: ["sport"],
      });
      const deleted = await ProgressLog.destroy({ where: { id } });
      if (deleted) {
        res.status(200).json({
          message: `Progress log deleted with sport ${
            findLog ? findLog.sport : "unknown"
          } successfully`,
        });
      } else {
        res.status(404).json({ message: "Progress log not found" });
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = Controller;
