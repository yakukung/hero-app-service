import { RESPONSE_MESSAGES } from "../constants/response.constant.js";
import { HTTP_STATUS } from "../constants/http_status.constants.js";
import { responseTemplates } from "../utils/response.utils.js";
import { verifyAccessToken } from "../utils/jwt.utils.js";
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
