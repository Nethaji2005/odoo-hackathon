import api from './api'

export const attendanceService = {
  /** Employee: check in */
  checkIn: (note = '') =>
    api.post('/attendance/check-in', { note }).then((r) => r.data),

  /** Employee: check out */
  checkOut: (note = '') =>
    api.post('/attendance/check-out', { note }).then((r) => r.data),

  /** Employee: today's record */
  getToday: () =>
    api.get('/attendance/me/today').then((r) => r.data),

  /** Employee: this week's records */
  getWeek: () =>
    api.get('/attendance/me/week').then((r) => r.data),

  /** Employee: last 60 days */
  getMyAttendance: () =>
    api.get('/attendance/me').then((r) => r.data),

  /** Admin/HR: all attendance, with optional filters */
  getAllAttendance: (params = {}) =>
    api.get('/attendance', { params }).then((r) => r.data),

  /** Admin/HR: one employee's attendance */
  getEmployeeAttendance: (employeeId) =>
    api.get(`/attendance/employee/${employeeId}`).then((r) => r.data),
}
