const { ProgressLog, UserPreference } = require("../models");

class Controller {
  static async getProgressLog(req, res) {
    try {
      const data = await ProgressLog.findAll({
        attributes: ["caloriesBurned", "fitnessGoal"],
      });
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  static async getUserPreferences(req, res) {
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
  static async updateUserPreferences(req, res) {
    try {
      const { UserId } = req.params;
      const { sportType, intensityLevel } = req.body;

      const [updated] = await UserPreference.update(
        { sportType, intensityLevel },
        { where: { userId } }
      );

      if (updated) {
        const updatedPreference = await UserPreference.findOne({
          where: { userId },
        });
        res.status(200).json(updatedPreference);
      } else {
        res.status(404).json({ message: "User preferences not found" });
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = Controller;
