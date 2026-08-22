import axios from 'axios'

/**
 * Axios base instance.
 * Uses Vite's /api proxy in development (no hardcoded port).
 * In production, set VITE_API_BASE_URL environment variable.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// ── Request interceptor: attach JWT ──────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dayflow_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response interceptor: unwrap data or throw error message ─────────────────
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // 401 — token expired/invalid — clear stored token
    if (error.response?.status === 401) {
      localStorage.removeItem('dayflow_token')
      localStorage.removeItem('dayflow_user')
    }
    const message =
      error.response?.data?.message || error.message || 'An unexpected error occurred'
    return Promise.reject(new Error(message))
  }
)

// ── Auth service ──────────────────────────────────────────────────────────────
// NOTE: The interceptor already unwraps response.data, so we get { success, message, data }
// directly. We then extract .data from that.
export const authService = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }).then((r) => r.data),

  register: (payload) =>
    api.post('/auth/register', payload).then((r) => r.data),

  getMe: () =>
    api.get('/auth/me').then((r) => r.data),
}

// ── Employee service ──────────────────────────────────────────────────────────
export const employeeService = {
  getMyProfile: () => api.get('/employees/me').then((r) => r.data),
  updateMyProfile: (data) => api.put('/employees/me', data).then((r) => r.data),
  getEmployees: (params) => api.get('/employees', { params }).then((r) => r.data),
  getEmployee: (id) => api.get(`/employees/${id}`).then((r) => r.data),
  createEmployee: (data) => api.post('/employees', data).then((r) => r.data),
  updateEmployee: (id, data) => api.put(`/employees/${id}`, data).then((r) => r.data),
}

// ── Payroll service ───────────────────────────────────────────────────────────
export const payrollService = {
  getMyPayroll: () => api.get('/payroll/me').then((r) => r.data),
  getPayroll: (employeeId) => api.get(`/payroll/${employeeId}`).then((r) => r.data),
  createPayroll: (employeeId, data) => api.post(`/payroll/${employeeId}`, data).then((r) => r.data),
  updatePayroll: (employeeId, data) => api.put(`/payroll/${employeeId}`, data).then((r) => r.data),
}

export default api
