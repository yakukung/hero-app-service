import { RESPONSE_MESSAGES } from "../constants/response.constant.js";
import { models } from "../models/sequelize/associations.js";
import { responseTemplates } from "../utils/response.utils.js";

const forbiddenMessage = {
  message: {
    th: "ไม่มีสิทธิ์เข้าถึงส่วนผู้ดูแลระบบ",
    en: "Admin access is required.",
  },
};

export const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user?.role_id) {
      const response = responseTemplates.setUnauthorizedResponse(
        RESPONSE_MESSAGES.TOKEN_INVALID_INVALID_ERROR,
      );
      return res.status(parseInt(response.code)).json(response);
    }

    const role = await models.Roles.findOne({
      where: {
        id: req.user.role_id,
        name: "ADMIN",
        visible_flag: true,
        status_flag: "ACTIVE",
      },
    });

    if (!role) {
      const response = responseTemplates.setForbiddenResponse(forbiddenMessage);
      return res.status(parseInt(response.code)).json(response);
    }

    return next();
  } catch (error) {
    console.error(error);
    const response = responseTemplates.setInternalServerErrorResponse(
      RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
    );
    return res.status(parseInt(response.code)).json(response);
  }
};
