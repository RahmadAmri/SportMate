"use strict";

const axios = require("axios");
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
    const { data } = await axios.get(
      "https://exercisedb.p.rapidapi.com/exercises/bodyPart/back",
      {
        headers: {
          "x-rapidapi-key":
            "0c79c96208msh9725ea4ac6e4135p15b915jsn0d3611e39830",
          "x-rapidapi-host": "exercisedb.p.rapidapi.com",
        },
      }
    );

    const exercises = data.map((element) => {
      delete element.id;
      element.createdAt = new Date();
      element.updatedAt = new Date();
      return element;
    });
    await queryInterface.bulkInsert("Backs", exercises, {});
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("Backs", null, {});
  },
};
