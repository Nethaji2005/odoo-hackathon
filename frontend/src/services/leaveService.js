import api from './api'

export const leaveService = {
  /** Employee: apply for leave */
  applyLeave: (payload) =>
    api.post('/leave', payload).then((r) => r.data),

  /** Employee: view own leave requests */
  getMyLeaves: () =>
    api.get('/leave/me').then((r) => r.data),

  /** Admin/HR: all leave requests */
  getAllLeaves: (params = {}) =>
    api.get('/leave', { params }).then((r) => r.data),

  /** Admin/HR: single leave detail */
  getLeaveById: (id) =>
    api.get(`/leave/${id}`).then((r) => r.data),

  /** Admin/HR: approve */
  approveLeave: (id, adminComment = '') =>
    api.patch(`/leave/${id}/approve`, { adminComment }).then((r) => r.data),

  /** Admin/HR: reject */
  rejectLeave: (id, adminComment = '') =>
    api.patch(`/leave/${id}/reject`, { adminComment }).then((r) => r.data),
}
