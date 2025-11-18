import { DataTypes } from "sequelize";
import { v7 as uuidv7 } from "uuid";
import { sequelize } from "../../configs/sequelize.configs.js";
import { STATUS_FLAG } from "../../constants/status_flag.constants.js";

const PAYMENT_METHODS = ["PROMPTPAY"];
const PAYMENT_STATUS = ["PENDING", "SUCCESSFUL", "FAILED", "REFUNDED"];

export const UsersPayments = sequelize.define(
  "users_payments",
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
    reference_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    reference_table: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.ENUM,
      values: PAYMENT_METHODS,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "THB",
    },
    payment_status: {
      type: DataTypes.ENUM,
      values: PAYMENT_STATUS,
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
      type: DataTypes.ENUM,
      values: Object.values(STATUS_FLAG),
      allowNull: false,
      defaultValue: STATUS_FLAG.ACTIVE,
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
    tableName: "users_payments",
    timestamps: false,
    indexes: [
      {
        name: "idx_user_payments_user_id",
        fields: ["user_id"],
      },
    ],
  }
);

