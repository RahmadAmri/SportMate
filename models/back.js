"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Back extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Back.belongsTo(models.User, {
        foreignKey: "UserId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }
  Back.init(
    {
      UserId: DataTypes.INTEGER,
      bodyPart: DataTypes.STRING,
      equipment: DataTypes.STRING,
      gifUrl: DataTypes.STRING,
      name: DataTypes.STRING,
      target: DataTypes.STRING,
      secondaryMuscles: DataTypes.STRING,
      instructions: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Back",
    }
  );
  return Back;
};
