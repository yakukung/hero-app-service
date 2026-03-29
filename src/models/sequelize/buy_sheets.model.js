import { DataTypes } from "sequelize";
import { v7 as uuidv7 } from "uuid";
import { sequelize } from "../../configs/sequelize.configs.js";
import {
  ACCOUNT_STATUS,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
} from "../../constants/db_schema.constants.js";

export const BuySheets = sequelize.define(
  "buy_sheets",
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
    sheet_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "sheets",
        key: "id",
      },
    },
    payment_method: {
      type: DataTypes.ENUM(...PAYMENT_METHODS),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    payment_status: {
      type: DataTypes.ENUM(...PAYMENT_STATUS),
      allowNull: false,
      defaultValue: "PENDING",
    },
    slip_image_url: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: "buy_sheets",
    timestamps: false,
    indexes: [
      {
        name: "idx_buy_sheets_user_id",
        fields: ["user_id"],
      },
      {
        name: "idx_buy_sheets_sheet_id",
        fields: ["sheet_id"],
      },
    ],
  },
);
