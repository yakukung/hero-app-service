import { DataTypes } from "sequelize";
import { sequelize } from "../../configs/sequelize.configs.js";
import { AUTH_PROVIDER } from "../../constants/auth_provider.constants.js";
import { v7 as uuidv7 } from "uuid";
import { STATUS_FLAG } from "../../constants/status_flag.constants.js";

export const Users = sequelize.define(
  "users",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: () => uuidv7(),
    },
    username: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    password: {
      type: DataTypes.BLOB,
      allowNull: true,
    },
    profile_image: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    auth_provider: {
      type: DataTypes.ENUM,
      values: [AUTH_PROVIDER.EMAIL_PASSWORD, AUTH_PROVIDER.GOOGLE],
      defaultValue: AUTH_PROVIDER.EMAIL_PASSWORD,
      allowNull: false,
    },
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "roles",
        key: "id",
      },
    },
    visible_flag: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    status_flag: {
      type: DataTypes.ENUM,
      values: Object.values(STATUS_FLAG),
      allowNull: false,
      defaultValue: STATUS_FLAG.PENDING,
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
    tableName: "users",
    timestamps: false,
    indexes: [
      {
        name: "unique_email",
        unique: true,
        fields: ["email"],
      },
    ],
  }
);
