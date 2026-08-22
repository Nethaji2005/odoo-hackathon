import api from "./api.js";

/**
 * Payroll service — all Payroll API calls.
 */

// Employee self-route
export const getMyPayroll = () => api.get("/payroll/me").then((r) => r.data.payroll);

// Admin/HR routes
export const getPayroll = (employeeId) =>
  api.get(`/payroll/${employeeId}`).then((r) => r.data.payroll);

export const createPayroll = (employeeId, data) =>
  api.post(`/payroll/${employeeId}`, data).then((r) => r.data.payroll);

export const updatePayroll = (employeeId, data) =>
  api.put(`/payroll/${employeeId}`, data).then((r) => r.data.payroll);
