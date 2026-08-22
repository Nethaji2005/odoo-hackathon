/**
 * successResponse — standard success envelope
 */
export const successResponse = (res, statusCode, message, data = null) => {
  const payload = { success: true, message };
  if (data !== null) payload.data = data;
  return res.status(statusCode).json(payload);
};

/**
 * errorResponse — standard error envelope
 */
export const errorResponse = (res, statusCode, message, errors = null) => {
  const payload = { success: false, message };
  if (errors !== null) payload.errors = errors;
  return res.status(statusCode).json(payload);
};
