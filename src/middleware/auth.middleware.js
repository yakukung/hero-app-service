import { RESPONSE_MESSAGES } from "../constants/response.constant.js";
import { HTTP_STATUS } from "../constants/http_status.constants.js";
import { STATUS_FLAG } from "../constants/status_flag.constants.js";
import { responseTemplates } from "../utils/response.utils.js";
import { verifyAccessToken } from "../utils/jwt.utils.js";
import { models } from "../models/sequelize/associations.js";

const accountInactiveMessage = {
  message: {
    th: "บัญชีนี้ไม่สามารถใช้งานได้ โปรดติดต่อผู้ดูแลระบบ",
    en: "This account cannot be used. Please contact the administrator.",
  },
};

export const authMiddleware = async (req, res, next) => {
  try {
    const bearer = req.header("Authorization");

    if (!bearer) {
      const response = responseTemplates.setUnauthorizedResponse(
        RESPONSE_MESSAGES.TOKEN_INVALID_INVALID_ERROR,
      );
      return res.status(parseInt(response.code)).json(response);
    }
    const [, token] = bearer.split(" ");
    if (!token) {
      const response = responseTemplates.setUnauthorizedResponse(
        RESPONSE_MESSAGES.TOKEN_INVALID_INVALID_ERROR,
      );
      return res.status(parseInt(response.code)).json(response);
    }
    const accessToken = verifyAccessToken(token);
    switch (accessToken.code) {
      case HTTP_STATUS.OK.code:
        req.user = { id: accessToken.data.sub, role_id: accessToken.data.role };

        const user = await models.Users.findOne({
          where: { id: req.user.id },
          attributes: ["status_flag"],
        });

        if (user && user.status_flag !== STATUS_FLAG.ACTIVE) {
          const response = responseTemplates.setUnauthorizedResponse(
            accountInactiveMessage,
          );
          return res.status(parseInt(response.code)).json(response);
        }

        return next();
      case HTTP_STATUS.UNAUTHORIZED.code:
      case HTTP_STATUS.BAD_REQUEST.code:
        return res.status(parseInt(accessToken.code)).json(accessToken);
      default:
        const response = responseTemplates.setInternalServerErrorResponse(
          RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        );
        return res.status(parseInt(response.code)).json(response);
    }
  } catch (error) {
    console.log(error);
    const response = responseTemplates.setInternalServerErrorResponse(
      RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
    );
    return res.status(parseInt(response.code)).json(response);
  }
};
