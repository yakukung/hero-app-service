import { DataTypes } from "sequelize";
import { v7 as uuidv7 } from "uuid";
import { sequelize } from "../../configs/sequelize.configs.js";
import {
  ACTIVE_INACTIVE_STATUS,
  CATEGORY_ENUM_VALUES,
} from "../../constants/db_schema.constants.js";

export const Categories = sequelize.define(
  "categories",
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
    name: {
      type: DataTypes.ENUM(...CATEGORY_ENUM_VALUES),
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
    tableName: "categories",
    timestamps: false,
    indexes: [
      {
        name: "idx_categories_sheet_id",
        fields: ["sheet_id"],
      },
      {
        name: "idx_categories_name",
        fields: ["name"],
      },
    ],
  },
);
