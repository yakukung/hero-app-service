import { mapping as mapAnswersResponse } from "./sheets_answers.mapping.js";
export const mapping = {
  async mapSheetsQuestions(data, count) {
    try {
      let result = [];
      for (let index = 0; index < data.length; index++) {
        const element = data[index].dataValues;
        const mapData = await this.mapSheetQuestion(element);
        result.push(mapData);
      }
      return {
        total_items: parseInt(count),
        sheets_questions: result,
      };
    } catch (error) {
      console.log(error);
    }
  },
  async mapSheetsQuestionsDetail(data) {
    try {
      let result = [];
      for (let index = 0; index < data.length; index++) {
        const element = data[index].dataValues;
        const mapData = await this.mapSheetQuestionDetail(element);
        result.push(mapData);
      }
      return result;
    } catch (error) {
      console.log(error);
    }
  },
  async mapSheetQuestion(data) {
    try {
      return {
        id: data.id,
        sheet_id: data.sheet_id,
        question_text: data.question_text,
        explanation: data.explanation,
        index: data.index,
        flag: {
          visible_flag: data.visible_flag,
          status_flag: data.status_flag,
          status_modified_at: data.status_modified_at,
        },
        operation: {
          created_at: data.created_at,
          created_by: data.created_by,
          updated_at: data.updated_at,
          updated_by: data.updated_by,
        },
      };
    } catch (error) {
      console.log(error);
    }
  },
  async mapSheetQuestionDetail(data) {
    try {
      const answers = data.answers
        ? await mapAnswersResponse.mapSheetAnswerDetail(data.answers)
        : null;
      return {
        id: data.id,
        sheet_id: data.sheet_id,
        question_text: data.question_text,
        explanation: data.explanation,
        index: data.index,
        answers: answers,
        flag: {
          visible_flag: data.visible_flag,
          status_flag: data.status_flag,
          status_modified_at: data.status_modified_at,
        },
        operation: {
          created_at: data.created_at,
          created_by: data.created_by,
          updated_at: data.updated_at,
          updated_by: data.updated_by,
        },
      };
    } catch (error) {
      console.log(error);
    }
  },
};
