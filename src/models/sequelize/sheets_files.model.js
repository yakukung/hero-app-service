import { DataTypes } from "sequelize";
import { v7 as uuidv7 } from "uuid";
import { sequelize } from "../../configs/sequelize.configs.js";
import { ACTIVE_INACTIVE_STATUS } from "../../constants/db_schema.constants.js";

export const SheetsFiles = sequelize.define(
  "sheets_files",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: () => uuidv7(),
    },
    sheet_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "sheets",
        key: "id",
      },
    },
    format: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    size: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    original_path: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    thumbnail_path: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    index: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    checksum: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    visible_flag: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    status_flag: {
      type: DataTypes.ENUM(...ACTIVE_INACTIVE_STATUS),
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
    tableName: "sheets_files",
    timestamps: false,
    indexes: [
      {
        name: "idx_sheets_files_sheet_id",
        fields: ["sheet_id"],
      },
    ],
  },
);
