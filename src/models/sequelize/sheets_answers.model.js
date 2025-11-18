import { DataTypes } from "sequelize";
import { v7 as uuidv7 } from "uuid";
import { sequelize } from "../../configs/sequelize.configs.js";
import { STATUS_FLAG } from "../../constants/status_flag.constants.js";

export const SheetsAnswers = sequelize.define(
  "sheets_answers",
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: () => uuidv7(),
    },
    question_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "sheets_questions",
        key: "id",
      },
    },
    answer_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    is_correct: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    index: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
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
    tableName: "sheets_answers",
    timestamps: false,
    indexes: [
      {
        name: "idx_sheets_answers_question_id",
        fields: ["question_id"],
      },
    ],
  }
);

