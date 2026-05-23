import { sequelize } from "../src/configs/sequelize.configs.js";
import { v4 as uuidv4 } from "uuid";

async function seedPremiumRole() {
  try {
    await sequelize.authenticate();
    console.log("Database connected...");

    const [existing] = await sequelize.query(
      "SELECT id FROM roles WHERE name = 'PREMIUM_MEMBER' LIMIT 1",
    );

    if (existing.length > 0) {
      console.log('Role "PREMIUM_MEMBER" already exists (id: %s)', existing[0].id);
    } else {
      const id = uuidv4();
      await sequelize.query(
        "INSERT INTO roles (id, name, visible_flag, status_flag, created_at, updated_at) VALUES (?, 'PREMIUM_MEMBER', 1, 'ACTIVE', NOW(), NOW())",
        { replacements: [id] },
      );
      console.log('Created role "PREMIUM_MEMBER" (id: %s)', id);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await sequelize.close();
  }
}

seedPremiumRole();
