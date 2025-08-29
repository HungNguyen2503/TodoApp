export const sendJSON = (res, statusCode, payload) => {
  res.status(statusCode).json(payload);
};

export const sendError = (res, statusCode, message, details = null) => {
  const errorPayload = { error: { message } };
  if (details) {
    errorPayload.error.details = details;
  }
  sendJSON(res, statusCode, errorPayload);
};