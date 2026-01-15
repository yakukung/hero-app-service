import { DataTypes } from "sequelize";
import { v7 as uuidv7 } from "uuid";
import { sequelize } from "../../configs/sequelize.configs.js";
import { STATUS_FLAG } from "../../constants/status_flag.constants.js";

export const Keywords = sequelize.define(
  "keywords",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: () => uuidv7(),
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },
    usage_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
    tableName: "keywords",
    timestamps: false,

    hooks: {
      beforeCreate: async (data) => {
        data.created_at = new Date();
      },
      beforeUpdate: async (data) => {
        data.updated_at = new Date();
      },
      beforeBulkUpdate: async (data) => {
        data.attributes.updated_at = new Date();
        data.fields.push("updated_at");
        data.attributes.updated_by = "SYSTEM";
        data.fields.push("updated_by");

        if (data.attributes.status_flag) {
          if (
            data.attributes.status_flag.includes(
              STATUS_FLAG.ACTIVE,
              STATUS_FLAG.INACTIVE
            )
          ) {
            data.attributes.visible_flag = true;
            data.fields.push("visible_flag");
            data.attributes.status_modified_at = new Date();
            data.fields.push("status_modified_at");
          } else {
            data.attributes.visible_flag = false;
            data.fields.push("visible_flag");
            data.attributes.status_modified_at = new Date();
            data.fields.push("status_modified_at");
          }
        }
      },
    },
  }
);
