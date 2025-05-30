"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    const data = require("../progressLog.json", "utf-8").map((element) => {
      delete element.id; // Remove id field if it exists
      element.createdAt = new Date();
      element.updatedAt = new Date();
      return element;
    });
    await queryInterface.bulkInsert("ProgressLogs", data, {});
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("ProgressLogs", null, {});
  },
};
