import { DataTypes } from "sequelize";
import { sequelize } from "../../configs/sequelize.configs.js";
import { v7 as uuidv7 } from "uuid";
import { STATUS_FLAG } from "../../constants/status_flag.constants.js";

export const Wallets = sequelize.define(
  "wallets",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: () => uuidv7(),
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      unique: true,
    },
    balance: {
      type: DataTypes.DECIMAL(19, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "THB",
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
    tableName: "wallets",
    timestamps: false,
    indexes: [
      {
        name: "idx_wallets_user_id",
        unique: true,
        fields: ["user_id"],
      },
    ],
    hooks: {
      beforeUpdate: (instance) => {
        // console.log("🚀 ~ beforeUpdate:", instance);
      },

      beforeBulkUpdate: (instance) => {
        instance.attributes.updated_at = new Date();
        instance.fields.push("updated_at");
        if (!instance.attributes.updated_by) {
          instance.attributes.updated_by = instance.user?.id || "SYSTEM";
          instance.fields.push("updated_by");
        }

        if (instance.attributes.status_flag) {
          if (
            instance.attributes.status_flag.includes(
              STATUS_FLAG.ACTIVE,
              STATUS_FLAG.INACTIVE,
            )
          ) {
            instance.attributes.visible_flag = true;
            instance.fields.push("visible_flag");
            instance.attributes.status_modified_at = new Date();
            instance.fields.push("status_modified_at");
          } else {
            instance.attributes.visible_flag = false;
            instance.fields.push("visible_flag");
            instance.attributes.status_modified_at = new Date();
            instance.fields.push("status_modified_at");
          }
        }
      },
    },
  },
);
