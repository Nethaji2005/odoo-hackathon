import api from "./api.js";

/**
 * Employee service — all Employee API calls.
 */

// Employee self-routes
export const getMyProfile = () => api.get("/employees/me").then((r) => r.data.employee);

export const updateMyProfile = (data) =>
  api.put("/employees/me", data).then((r) => r.data.employee);

// Admin/HR routes
export const getEmployees = (params = {}) =>
  api.get("/employees", { params }).then((r) => r.data.employees);

export const getEmployee = (id) =>
  api.get(`/employees/${id}`).then((r) => r.data.employee);

export const createEmployee = (data) =>
  api.post("/employees", data).then((r) => r.data.employee);

export const updateEmployee = (id, data) =>
  api.put(`/employees/${id}`, data).then((r) => r.data.employee);
