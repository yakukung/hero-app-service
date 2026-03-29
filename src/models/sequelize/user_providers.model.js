import { DataTypes } from "sequelize";
import { v7 as uuidv7 } from "uuid";
import { sequelize } from "../../configs/sequelize.configs.js";
import { ACCOUNT_STATUS } from "../../constants/db_schema.constants.js";

export const UserProviders = sequelize.define(
  "user_providers",
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
    provider_user_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    provider_name: {
      type: DataTypes.ENUM("GOOGLE"),
      allowNull: false,
    },
    provider_username: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    provider_email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    visible_flag: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    status_flag: {
      type: DataTypes.ENUM(...ACCOUNT_STATUS),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
    created_at: {
      type: DataTypes.DATE(3),
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    created_by: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "SYSTEM",
    },
    updated_at: {
      type: DataTypes.DATE(3),
      allowNull: true,
    },
    updated_by: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status_modified_at: {
      type: DataTypes.DATE(3),
      allowNull: true,
    },
  },
  {
    tableName: "user_providers",
    timestamps: false,
    indexes: [
      {
        name: "unique_provider_user_id",
        unique: true,
        fields: ["provider_user_id"],
      },
      {
        name: "unique_user_provider",
        unique: true,
        fields: ["user_id", "provider_name"],
      },
    ],
  }
);
