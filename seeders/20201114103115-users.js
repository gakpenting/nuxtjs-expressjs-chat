"use strict";
const bcrypt = require("bcrypt");
const password = process.env.PASSWORD || "defaultpassword";
const username = process.env.USERNAME || "admin";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("users", [
      {
        username: username,
        password: await bcrypt.hash(password, 1),
        token: require("crypto").randomBytes(64).toString("hex"),
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("users", { username}, {});
  },
};
