export const mapping = {
  async mapSheetsAnswers(data, count) {
    try {
      let result = [];
      for (let index = 0; index < data.length; index++) {
        const element = data[index].dataValues;
        const mapData = await this.mapSheetAnswer(element);
        result.push(mapData);
      }
      return {
        total_items: parseInt(count),
        sheets_answers: result,
      };
    } catch (error) {
      console.log(error);
    }
  },
  async mapSheetAnswerDetail(data) {
    try {
      let result = [];
      for (let index = 0; index < data.length; index++) {
        const element = data[index].dataValues;
        const mapData = await this.mapSheetAnswer(element);
        result.push(mapData);
      }
      return result;
    } catch (error) {
      console.log(error);
    }
  },
  async mapSheetAnswer(data) {
    try {
      return {
        id: data.id,
        question_id: data.question_id,
        answer_text: data.answer_text,
        is_correct: data.is_correct,
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
};
