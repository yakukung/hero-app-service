import { CATEGORY_ENUM_VALUES } from "../constants/db_schema.constants.js";
import { RESPONSE_MESSAGES } from "../constants/response.constant.js";
import { models } from "../models/sequelize/associations.js";
import { responseTemplates } from "../utils/response.utils.js";

export const service = {
  async getAll(_req, _res) {
    try {
      const masterSubjects = await models.Categories.findAll({
        attributes: ["name"],
        group: ["name"],
        order: [["name", "ASC"]],
      });

      if (masterSubjects.length > 0) {
        return responseTemplates.setOKResponse({
          total_items: masterSubjects.length,
          categories: masterSubjects.map((s) => ({
            name: s.name,
          })),
        });
      }

      return responseTemplates.setOKResponse({
        total_items: CATEGORY_ENUM_VALUES.length,
        categories: CATEGORY_ENUM_VALUES.map((name) => ({ name })),
      });
    } catch (error) {
      console.error(error);
      return responseTemplates.setOKResponse({
        total_items: CATEGORY_ENUM_VALUES.length,
        categories: CATEGORY_ENUM_VALUES.map((name) => ({ name })),
      });
    }
  },

  async getById(_req, _res) {
    return responseTemplates.setNotFoundResponse(
      RESPONSE_MESSAGES.DATA_NOT_FOUND,
    );
  },
};
