export const HTTP_STATUS = Object.freeze({
  OK: {
    code: 200,
    message: "OK",
  },
  CREATED: {
    code: 201,
    message: "CREATED",
  },
  NO_CONTENT: {
    code: 204,
    message: "NO_CONTENT",
  },
  BAD_REQUEST: {
    code: 400,
    message: "BAD_REQUEST",
  },
  NOT_FOUND: {
    code: 404,
    message: "NOT_FOUND",
  },
  CONFLICT: {
    code: 409,
    message: "CONFLICT",
  },
  UNAUTHORIZED: {
    code: 401,
    message: "UNAUTHORIZED",
  },
  FORBIDDEN: {
    code: 403,
    message: "FORBIDDEN",
  },
  TOO_MANY_REQUESTS: {
    code: 429,
    message: "TOO_MANY_REQUESTS",
  },
  INTERNAL_SERVER_ERROR: {
    code: 500,
    message: "INTERNAL_SERVER_ERROR",
  },
});
