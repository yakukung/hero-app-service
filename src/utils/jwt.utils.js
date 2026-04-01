import jwt from "jsonwebtoken";
import { JWT_ERROR } from "../constants/jwt.constant.js";
import { responseTemplates } from "./response.utils.js";
import { RESPONSE_MESSAGES } from "../constants/response.constant.js";

const payload = (user_id, role_id) => {
  return {
    version: process.env.JWT_VERSION,
    iss: process.env.JWT_ISSUER,
    sub: user_id,
    aud: process.env.JWT_AUDIENCE.split(","),
    azp: process.env.CLIENT_ID,
    role: role_id,
    iat: Math.floor(Date.now() / 1000),
  };
};

const generateAccessToken = (user_id, role_id) => {
  const dataPayload = payload(user_id, role_id);
  return jwt.sign(dataPayload, process.env.JWT_SECRET_ACCESS_TOKEN, {
    algorithm: process.env.JWT_ALGORITHM,
    expiresIn: process.env.JWT_EXPIRE_ACCESS_TOKEN,
    notBefore: process.env.JWT_NOT_BEFORE,
  });
};

const generateRefreshToken = (user_id) => {
  return jwt.sign(
    {
      type: "refresh",
      sub: user_id,
      iss: process.env.JWT_ISSUER,
      aud: process.env.JWT_AUDIENCE.split(","),
    },
    process.env.JWT_SECRET_REFRESH_TOKEN,
    {
      algorithm: process.env.JWT_ALGORITHM,
      expiresIn: process.env.JWT_EXPIRE_REFRESH_TOKEN,
      notBefore: process.env.JWT_NOT_BEFORE,
    },
  );
};

const verifyAccessToken = (accessToken) => {
  try {
    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_SECRET_ACCESS_TOKEN,
    );
    return responseTemplates.setOKResponse(decoded);
  } catch (error) {
    switch (error.name) {
      case JWT_ERROR.TOKEN_INVALID:
        return responseTemplates.setUnauthorizedResponse(
          RESPONSE_MESSAGES.TOKEN_INVALID_INVALID_ERROR,
        );
      case JWT_ERROR.TOKEN_EXPIRED_ERROR:
        return responseTemplates.setUnauthorizedResponse(
          RESPONSE_MESSAGES.TOKEN_EXPIRED_INVALID_ERROR,
        );
      case JWT_ERROR.SYNTAX_ERROR:
        return responseTemplates.setUnauthorizedResponse(
          RESPONSE_MESSAGES.TOKEN_SYNTAX_ERROR_INTERNAL_ERROR,
        );
      default:
        return responseTemplates.setInternalServerErrorResponse(
          RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        );
    }
  }
};

const verifyRefreshToken = (refreshToken) => {
  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_SECRET_REFRESH_TOKEN,
    );
    return responseTemplates.setOKResponse(decoded);
  } catch (error) {
    switch (error.name) {
      case JWT_ERROR.TOKEN_INVALID:
        return responseTemplates.setUnauthorizedResponse(
          RESPONSE_MESSAGES.TOKEN_INVALID_INVALID_ERROR,
        );
      case JWT_ERROR.TOKEN_EXPIRED_ERROR:
        return responseTemplates.setUnauthorizedResponse(
          RESPONSE_MESSAGES.TOKEN_EXPIRED_INVALID_ERROR,
        );
      case JWT_ERROR.SYNTAX_ERROR:
        return responseTemplates.setUnauthorizedResponse(
          RESPONSE_MESSAGES.TOKEN_SYNTAX_ERROR_INTERNAL_ERROR,
        );
      default:
        return responseTemplates.setInternalServerErrorResponse(
          RESPONSE_MESSAGES.INTERNAL_SERVER_ERROR,
        );
    }
  }
};

export {
  payload,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
