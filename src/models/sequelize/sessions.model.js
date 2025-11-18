import { DataTypes } from "sequelize";
import { v7 as uuidv7 } from "uuid";
import { sequelize } from "../../configs/sequelize.configs.js";

export const Sessions = sequelize.define(
  "sessions",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: () => uuidv7(),
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    refresh_token: {
      type: DataTypes.BLOB("tiny"),
      allowNull: false,
      unique: true,
    },
    issued_at: {
      type: DataTypes.DATE(3),
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    expires_at: {
      type: DataTypes.DATE(3),
      allowNull: false,
    },
    revoked_flag: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    tableName: "sessions",
    timestamps: false,
  }
);

