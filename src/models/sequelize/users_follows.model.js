import { DataTypes } from "sequelize";
import { sequelize } from "../../configs/sequelize.configs.js";
import { v7 as uuidv7 } from "uuid";
import { STATUS_FLAG } from "../../constants/status_flag.constants.js";
import { ACTIVE_INACTIVE_STATUS } from "../../constants/db_schema.constants.js";

export const UsersFollows = sequelize.define(
  "users_follows",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: () => uuidv7(),
    },
    follower_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    following_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    visible_flag: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    status_flag: {
      type: DataTypes.ENUM(...ACTIVE_INACTIVE_STATUS),
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
    tableName: "users_follows",
    timestamps: false,
    indexes: [
      {
        name: "unique_follower_following",
        unique: true,
        fields: ["follower_id", "following_id"],
      },
      {
        name: "idx_following_id",
        fields: ["following_id"],
      },
    ],
    validate: {
      checkNotSelfFollow() {
        if (this.follower_id === this.following_id) {
          throw new Error("follower_id and following_id must be different");
        }
      },
    },
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
