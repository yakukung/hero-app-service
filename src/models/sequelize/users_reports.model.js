import { DataTypes } from "sequelize";
import { v7 as uuidv7 } from "uuid";
import { sequelize } from "../../configs/sequelize.configs.js";

const REPORT_TYPES = ["SPAM", "ABUSE", "BUG", "OTHER"];
const REPORT_STATUS = ["PENDING", "REVIEWING", "RESOLVED", "REJECTED"];

export const UsersReports = sequelize.define(
  "users_reports",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: () => uuidv7(),
    },
    reference_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    reference_table: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    report_type: {
      type: DataTypes.ENUM,
      values: REPORT_TYPES,
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
      allowNull: false,
    },
    visible_flag: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    status_flag: {
      type: DataTypes.ENUM,
      values: REPORT_STATUS,
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
    tableName: "users_reports",
    timestamps: false,
  }
);
