import { models } from "../models/sequelize/associations.js";

try {
  console.log("Models loaded successfully:", Object.keys(models));
  console.log(
    "UsersFollows associations:",
    Object.keys(models.UsersFollows.associations),
  );
  console.log("Users associations:", Object.keys(models.Users.associations));
  process.exit(0);
} catch (error) {
  console.error("Error loading models:", error);
  process.exit(1);
}
