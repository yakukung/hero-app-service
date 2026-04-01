import { DataTypes } from "sequelize";
import { sequelize } from "../../configs/sequelize.configs.js";
import { AUTH_PROVIDER } from "../../constants/auth_provider.constants.js";
import { v7 as uuidv7 } from "uuid";
import { STATUS_FLAG } from "../../constants/status_flag.constants.js";
import { ACCOUNT_STATUS } from "../../constants/db_schema.constants.js";

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
    point: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    keyword: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    total_wallet: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },
    visible_flag: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    status_flag: {
      type: DataTypes.ENUM(...ACCOUNT_STATUS),
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
    tableName: "users",
    timestamps: false,
    indexes: [
      {
        name: "unique_email",
        unique: true,
        fields: ["email"],
      },
      {
        name: "idx_users_username",
        fields: ["username"],
      },
      {
        name: "idx_users_role_id",
        fields: ["role_id"],
      },
      {
        name: "idx_users_status_flag",
        fields: ["status_flag"],
      },
    ],
    hooks: {
      beforeBulkUpdate: (instance) => {
        const addField = (field) => {
          if (!instance.fields.includes(field)) {
            instance.fields.push(field);
          }
        };
        const visibleStatuses = [STATUS_FLAG.ACTIVE, STATUS_FLAG.INACTIVE];

        instance.attributes.updated_at = new Date();
        addField("updated_at");
        if (!instance.attributes.updated_by) {
          instance.attributes.updated_by = instance.user?.id || "SYSTEM";
          addField("updated_by");
        }

        if (instance.attributes.status_flag) {
          if (visibleStatuses.includes(instance.attributes.status_flag)) {
            instance.attributes.visible_flag = true;
            addField("visible_flag");
            instance.attributes.status_modified_at = new Date();
            addField("status_modified_at");
          } else {
            instance.attributes.visible_flag = false;
            addField("visible_flag");
            instance.attributes.status_modified_at = new Date();
            addField("status_modified_at");
          }
        }
      },
    },
  },
);
