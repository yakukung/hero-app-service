import { RESPONSE_MESSAGES } from "../constants/response.constant.js";
import { responseTemplates } from "./response.utils.js";

export const serviceHandler = (handler) => async (req, res) => {
  try {
    const result = await handler(req, res);
    return res.status(parseInt(result.code)).json(result);
  } catch (error) {
    console.error(error);
    const response = responseTemplates.setInternalServerErrorResponse(
      RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
    );
    return res.status(parseInt(response.code)).json(response);
  }
};
