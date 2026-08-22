const Leave = require('../models/Leave');
const { sendSuccess, sendError } = require('../utils/response');
const { applyLeaveSchema, reviewLeaveSchema } = require('../validators/leaveValidator');

// ─── POST /api/v1/leave ───────────────────────────────────────────────────────
const applyLeave = async (req, res) => {
  try {
    const result = applyLeaveSchema.safeParse(req.body);
    if (!result.success) {
      return sendError(res, 400, 'Validation failed.', result.error.issues);
    }

    const { leaveType, startDate, endDate, remarks } = result.data;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Normalize to start of day (remove time component for fair comparison)
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(0, 0, 0, 0);

    if (end < start) {
      return sendError(res, 400, 'End date cannot be before start date.');
    }

    const leave = await Leave.create({
      employee: req.user.id,
      leaveType,
      startDate: start,
      endDate: end,
      remarks,
    });

    const populated = await leave.populate('employee', 'name email department');

    return sendSuccess(res, 201, 'Leave application submitted successfully.', { leave: populated });
  } catch (err) {
    console.error('[leave/applyLeave]', err);
    return sendError(res, 500, 'Server error.');
  }
};

// ─── GET /api/v1/leave/me ────────────────────────────────────────────────────
const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user.id })
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });
    return sendSuccess(res, 200, 'Your leave requests fetched.', { leaves });
  } catch (err) {
    console.error('[leave/getMyLeaves]', err);
    return sendError(res, 500, 'Server error.');
  }
};

// ─── GET /api/v1/leave  (Admin/HR) ───────────────────────────────────────────
const getAllLeaves = async (req, res) => {
  try {
    const { status, employeeId } = req.query;
    const query = {};
    if (status) query.status = status;
    if (employeeId) query.employee = employeeId;

    const leaves = await Leave.find(query)
      .populate('employee', 'name email department role')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'All leave requests fetched.', { leaves });
  } catch (err) {
    console.error('[leave/getAllLeaves]', err);
    return sendError(res, 500, 'Server error.');
  }
};

// ─── GET /api/v1/leave/:id  (Admin/HR) ───────────────────────────────────────
const getLeaveById = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('employee', 'name email department role')
      .populate('reviewedBy', 'name email');

    if (!leave) return sendError(res, 404, 'Leave request not found.');

    return sendSuccess(res, 200, 'Leave request fetched.', { leave });
  } catch (err) {
    console.error('[leave/getLeaveById]', err);
    return sendError(res, 500, 'Server error.');
  }
};

// ─── PATCH /api/v1/leave/:id/approve  (Admin/HR) ─────────────────────────────
const approveLeave = async (req, res) => {
  try {
    const result = reviewLeaveSchema.safeParse(req.body);
    if (!result.success) {
      return sendError(res, 400, 'Validation failed.', result.error.issues);
    }

    const leave = await Leave.findById(req.params.id);
    if (!leave) return sendError(res, 404, 'Leave request not found.');

    if (leave.status !== 'pending') {
      return sendError(res, 409, `This leave request is already ${leave.status}.`);
    }

    // Prevent an admin/HR from approving their own leave
    if (leave.employee.toString() === req.user.id) {
      return sendError(res, 403, 'You cannot approve your own leave request.');
    }

    leave.status = 'approved';
    leave.adminComment = result.data.adminComment || '';
    leave.reviewedBy = req.user.id;
    leave.reviewedAt = new Date();
    await leave.save();

    const populated = await leave.populate([
      { path: 'employee', select: 'name email department' },
      { path: 'reviewedBy', select: 'name email' },
    ]);

    return sendSuccess(res, 200, 'Leave request approved.', { leave: populated });
  } catch (err) {
    console.error('[leave/approveLeave]', err);
    return sendError(res, 500, 'Server error.');
  }
};

// ─── PATCH /api/v1/leave/:id/reject  (Admin/HR) ──────────────────────────────
const rejectLeave = async (req, res) => {
  try {
    const result = reviewLeaveSchema.safeParse(req.body);
    if (!result.success) {
      return sendError(res, 400, 'Validation failed.', result.error.issues);
    }

    const leave = await Leave.findById(req.params.id);
    if (!leave) return sendError(res, 404, 'Leave request not found.');

    if (leave.status !== 'pending') {
      return sendError(res, 409, `This leave request is already ${leave.status}.`);
    }

    if (leave.employee.toString() === req.user.id) {
      return sendError(res, 403, 'You cannot reject your own leave request.');
    }

    leave.status = 'rejected';
    leave.adminComment = result.data.adminComment || '';
    leave.reviewedBy = req.user.id;
    leave.reviewedAt = new Date();
    await leave.save();

    const populated = await leave.populate([
      { path: 'employee', select: 'name email department' },
      { path: 'reviewedBy', select: 'name email' },
    ]);

    return sendSuccess(res, 200, 'Leave request rejected.', { leave: populated });
  } catch (err) {
    console.error('[leave/rejectLeave]', err);
    return sendError(res, 500, 'Server error.');
  }
};

module.exports = { applyLeave, getMyLeaves, getAllLeaves, getLeaveById, approveLeave, rejectLeave };
