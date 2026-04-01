import { DataTypes } from "sequelize";
import { v7 as uuidv7 } from "uuid";
import { sequelize } from "../../configs/sequelize.configs.js";
import { ACTIVE_INACTIVE_STATUS } from "../../constants/db_schema.constants.js";

export const UsersSheetsAnswers = sequelize.define(
  "users_sheets_answers",
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
    question_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "sheets_questions",
        key: "id",
      },
    },
    selected_answer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "sheets_answers",
        key: "id",
      },
    },
    is_correct: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
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
    tableName: "users_sheets_answers",
    timestamps: false,
    indexes: [
      {
        name: "unique_user_question_answer",
        unique: true,
        fields: ["user_id", "question_id"],
      },
      {
        name: "idx_users_sheets_answers_question_id",
        fields: ["question_id"],
      },
      {
        name: "idx_users_sheets_answers_selected_answer_id",
        fields: ["selected_answer_id"],
      },
    ],
  }
);
