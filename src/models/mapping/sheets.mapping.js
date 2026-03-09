import { mapping as mapKeywordsResponse } from "./keywords.mapping.js";
import { mapping as mapSheetsQuestionsResponse } from "./sheets_questions.mapping.js";
import { mapping as mapSheetsFilesResponse } from "./sheets_files.mapping.js";
import { mapping as mapCategoriesResponse } from "./categories.mapping.js";
import { mapping as mapUsersResponse } from "./users.mapping.js";
export const mapping = {
  async mapSheets(data, count) {
    try {
      let result = [];
      for (let index = 0; index < data.length; index++) {
        const element = data[index].dataValues;
        const mapData = await this.mapSheet(element);
        result.push(mapData);
      }
      return {
        total_items: parseInt(count),
        sheets: result,
      };
    } catch (error) {
      console.log(error);
    }
  },
  async mapSheetsDetail(data, count) {
    try {
      let result = [];
      for (let index = 0; index < data.length; index++) {
        const element = data[index].dataValues;
        const mapData = await this.mapSheetDetail(element);
        result.push(mapData);
      }
      return {
        total_items: parseInt(count),
        sheets: result,
      };
    } catch (error) {
      console.log(error);
    }
  },
  async mapSheet(data) {
    try {
      return {
        id: data.id,
        author_id: data.author_id,
        title: data.title,
        description: data.description,
        rating: data.rating,
        price: data.price,
        course: data.course,
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
  async mapSheetDetail(data) {
    try {
      const keywords = data.keywords
        ? await mapKeywordsResponse.mapKeywordsDataOnly(data.keywords)
        : null;
      const questions = data.questions
        ? await mapSheetsQuestionsResponse.mapSheetsQuestionsDetail(
            data.questions,
          )
        : null;
      const files = data.files
        ? await mapSheetsFilesResponse.mapSheetsFilesDetail(data.files)
        : null;
      const categories = data.categories
        ? await mapCategoriesResponse.mapCategoriesDetail(data.categories)
        : null;
      const author = data.author
        ? await mapUsersResponse.mapUser(data.author)
        : null;
      let buyers = null;
      if (data.payments && data.payments.length > 0) {
        const buyersMap = new Map();
        for (const payment of data.payments) {
          if (payment.user && !buyersMap.has(payment.user.id)) {
            const mappedBuyer = await mapUsersResponse.mapUser(payment.user);
            buyersMap.set(payment.user.id, mappedBuyer);
          }
        }
        buyers = buyersMap.size > 0 ? Array.from(buyersMap.values()) : null;
      }
      return {
        id: data.id,
        author_id: data.author_id,
        author_name: author.username,
        title: data.title,
        description: data.description,
        rating: data.rating,
        price: data.price,
        course: data.course,
        categories: categories,
        keywords: keywords,
        questions: questions,
        files: files,
        buyers: buyers,
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
