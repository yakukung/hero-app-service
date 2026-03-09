import { Sequelize } from "sequelize";
import env from "../utils/dotenv.utils.js";

export const sequelize = new Sequelize(
  env.DB_DATABASE,
  env.DB_USERNAME,
  env.DB_PASSWORD,
  {
    host: env.DB_HOST,
    port: env.DB_PORT,
    dialect: env.DB_TYPE,
    logging: false,
  },
);
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection success");
  } catch (error) {
    console.error("Database connection failed", error);
  }
})();
