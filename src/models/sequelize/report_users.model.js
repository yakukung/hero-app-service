import { DataTypes } from "sequelize";
import { v7 as uuidv7 } from "uuid";
import { sequelize } from "../../configs/sequelize.configs.js";
import {
  REPORT_STATUS,
  REPORT_USER_TYPES,
} from "../../constants/db_schema.constants.js";

export const ReportUsers = sequelize.define(
  "report_users",
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
    report_type: {
      type: DataTypes.ENUM(...REPORT_USER_TYPES),
      allowNull: false,
    },
    reporter_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    visible_flag: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    status_flag: {
      type: DataTypes.ENUM(...REPORT_STATUS),
      allowNull: false,
      defaultValue: "PENDING",
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
    tableName: "report_users",
    timestamps: false,
    indexes: [
      {
        name: "idx_user_id",
        fields: ["user_id"],
      },
      {
        name: "idx_reporter_id",
        fields: ["reporter_id"],
      },
      {
        name: "idx_status_flag",
        fields: ["status_flag"],
      },
    ],
  },
);
