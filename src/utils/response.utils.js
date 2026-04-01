import { HTTP_STATUS } from "../constants/http_status.constants.js";

const responseUtils = (http_code, http_message, data, error) => {
  return {
    code: http_code,
    message: http_message,
    timestamp: new Date(),
    error: error,
    data: data,
  };
};

export const responseTemplates = {
  setOKResponse(result) {
    return responseUtils(
      HTTP_STATUS.OK.code,
      HTTP_STATUS.OK.message,
      result,
      null
    );
  },
  setCreatedResponse(result) {
    return responseUtils(
      HTTP_STATUS.CREATED.code,
      HTTP_STATUS.CREATED.message,
      result,
      null
    );
  },
  setNoContentResponse() {
    return responseUtils(
      HTTP_STATUS.NO_CONTENT.code,
      HTTP_STATUS.NO_CONTENT.message,
      null,
      null
    );
  },
  setBadRequestResponse(responseMessage) {
    return responseUtils(
      HTTP_STATUS.BAD_REQUEST.code,
      HTTP_STATUS.BAD_REQUEST.message,
      null,
      responseMessage
    );
  },
  setNotFoundResponse(responseMessage) {
    return responseUtils(
      HTTP_STATUS.NOT_FOUND.code,
      HTTP_STATUS.NOT_FOUND.message,
      null,
      responseMessage
    );
  },
  setConflictResponse(responseMessage) {
    return responseUtils(
      HTTP_STATUS.CONFLICT.code,
      HTTP_STATUS.CONFLICT.message,
      null,
      responseMessage
    );
  },
  setUnauthorizedResponse(responseMessage) {
    return responseUtils(
      HTTP_STATUS.UNAUTHORIZED.code,
      HTTP_STATUS.UNAUTHORIZED.message,
      null,
      responseMessage
    );
  },
  setForbiddenResponse(responseMessage) {
    return responseUtils(
      HTTP_STATUS.FORBIDDEN.code,
      HTTP_STATUS.FORBIDDEN.message,
      null,
      responseMessage
    );
  },
  setTooManyRequestsResponse(responseMessage) {
    return responseUtils(
      HTTP_STATUS.TOO_MANY_REQUESTS.code,
      HTTP_STATUS.TOO_MANY_REQUESTS.message,
      null,
      responseMessage
    );
  },
  setInternalServerErrorResponse(responseMessage) {
    return responseUtils(
      HTTP_STATUS.INTERNAL_SERVER_ERROR.code,
      HTTP_STATUS.INTERNAL_SERVER_ERROR.message,
      null,
      responseMessage
    );
  },
};

export const responseRepository = {
    setResult(status, result) {
        return{
            code: status.code,
            message: status.message,
            timestamp: new Date(),
            result: result,
        }
    }
}
  
