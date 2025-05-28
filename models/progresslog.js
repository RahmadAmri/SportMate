"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ProgressLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ProgressLog.belongsTo(models.User, {
        foreignKey: "UserId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }
  ProgressLog.init(
    {
      UserId: DataTypes.INTEGER,
      sport: DataTypes.STRING,
      duration: DataTypes.INTEGER,
      caloriesBurned: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "ProgressLog",
    }
  );
  return ProgressLog;
};
