import { DataTypes } from "sequelize";
import { v7 as uuidv7 } from "uuid";
import { sequelize } from "../../configs/sequelize.configs.js";

export const Tokens = sequelize.define(
  "tokens",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: () => uuidv7(),
    },
    session_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "sessions",
        key: "id",
      },
    },
    access_token: {
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
  },
  {
    tableName: "tokens",
    timestamps: false,
  }
);

