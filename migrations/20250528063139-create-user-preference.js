"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("UserPreferences", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      UserId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users", // Name of the table to reference
          key: "id", // Column in the referenced table
        },
        onDelete: "CASCADE", // Optional: define behavior on delete
        onUpdate: "CASCADE", // Optional: define behavior on update
      },
      preferredSports: {
        type: Sequelize.STRING,
      },
      fitnessGoal: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("UserPreferences");
  },
};
