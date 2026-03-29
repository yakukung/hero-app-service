import { CATEGORY_ENUM_VALUES } from "../constants/db_schema.constants.js";
import { RESPONSE_MESSAGES } from "../constants/response.constant.js";
import { responseTemplates } from "../utils/response.utils.js";

export const service = {
  async getAll(_req, _res) {
    return responseTemplates.setOKResponse({
      total_items: CATEGORY_ENUM_VALUES.length,
      categories: CATEGORY_ENUM_VALUES.map((name) => ({ name })),
    });
  },

  async getById(_req, _res) {
    return responseTemplates.setNotFoundResponse(RESPONSE_MESSAGES.DATA_NOT_FOUND);
  },
};
