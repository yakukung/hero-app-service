import { DataTypes } from "sequelize";
import { v7 as uuidv7 } from "uuid";
import { sequelize } from "../../configs/sequelize.configs.js";
import { STATUS_FLAG } from "../../constants/status_flag.constants.js";

export const UsersPlans = sequelize.define(
  "users_plans",
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
    plan_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "plans",
        key: "id",
      },
    },
    start_at: {
      type: DataTypes.DATE(3),
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE(3),
      allowNull: false,
    },
    auto_renew: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    tableName: "users_plans",
    timestamps: false,
    indexes: [
      {
        name: "idx_users_plans_user_id",
        fields: ["user_id"],
      },
      {
        name: "idx_users_plans_plan_id",
        fields: ["plan_id"],
      },
    ],
  }
);

