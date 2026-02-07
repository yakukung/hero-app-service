import { sequelize } from "./src/configs/sequelize.configs.js";

async function fixDatabase() {
  try {
    await sequelize.authenticate();
    console.log("Database connected...");

    // Check if we are using MySQL
    const dialect = sequelize.getDialect();
    console.log(`Dialect: ${dialect}`);

    if (dialect === "mysql") {
      await sequelize.query("ALTER TABLE posts MODIFY sheet_id CHAR(36) NULL;");
      console.log(
        "✅ Successfully altered table 'posts': sheet_id is now NULLABLE.",
      );
    } else {
      console.log("⚠️  Script optimized for MySQL. Please verify dialect.");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await sequelize.close();
  }
}

fixDatabase();
