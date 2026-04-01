import { DataTypes } from "sequelize";
import { v7 as uuidv7 } from "uuid";
import { sequelize } from "../../configs/sequelize.configs.js";
import { ACTIVE_INACTIVE_STATUS } from "../../constants/db_schema.constants.js";

export const Posts = sequelize.define(
  "posts",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: () => uuidv7(),
    },
    sheet_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "sheets",
        key: "id",
      },
    },
    user_id: {
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
    like_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    comment_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    share_count: {
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
      type: DataTypes.ENUM(...ACTIVE_INACTIVE_STATUS),
      allowNull: false,
      defaultValue: ACTIVE_INACTIVE_STATUS.ACTIVE,
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
    tableName: "posts",
    timestamps: false,
    indexes: [
      {
        name: "idx_posts_sheet_id",
        fields: ["sheet_id"],
      },
      {
        name: "idx_posts_user_id",
        fields: ["user_id"],
      },
      {
        name: "idx_posts_status_flag",
        fields: ["status_flag"],
      },
      {
        name: "idx_posts_created_at",
        fields: ["created_at"],
      },
    ],
  },
);
