"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserPreference extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      UserPreference.belongsTo(models.User, {
        foreignKey: "UserId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }
  UserPreference.init(
    {
      UserId: DataTypes.INTEGER,
      preferredSports: DataTypes.STRING,
      fitnessGoal: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "UserPreference",
    }
  );
  return UserPreference;
};
