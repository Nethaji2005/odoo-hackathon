const Attendance = require('../models/Attendance');
const { sendSuccess, sendError } = require('../utils/response');
const { checkInSchema, checkOutSchema } = require('../validators/attendanceValidator');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Return current date as 'YYYY-MM-DD' in UTC */
const getTodayStr = () => new Date().toISOString().split('T')[0];

/**
 * Return the Monday and Sunday bounding the given date (ISO week).
 * Returns { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }
 */
const getWeekRange = (dateInput = new Date()) => {
  const d = new Date(dateInput);
  // getDay(): 0=Sun, 1=Mon ... 6=Sat
  const day = d.getUTCDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() + diffToMon);
  monday.setUTCHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0],
  };
};

// ─── POST /api/v1/attendance/check-in ────────────────────────────────────────
const checkIn = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const today = getTodayStr();

    const result = checkInSchema.safeParse(req.body);
    if (!result.success) {
      return sendError(res, 400, 'Validation failed.', result.error.issues);
    }
    const { note } = result.data;

    const existing = await Attendance.findOne({ employee: employeeId, date: today });

    if (existing) {
      if (existing.checkIn) {
        return sendError(res, 409, 'You have already checked in today.');
      }
    }

    const now = new Date();
    let record;

    if (existing) {
      existing.checkIn = now;
      existing.status = 'present';
      record = await existing.save();
    } else {
      record = await Attendance.create({
        employee: employeeId,
        date: today,
        checkIn: now,
        status: 'present',
        note: note || '',
      });
    }

    return sendSuccess(res, 200, 'Checked in successfully.', { attendance: record });
  } catch (err) {
    console.error('[attendance/checkIn]', err);
    return sendError(res, 500, 'Server error.');
  }
};

// ─── POST /api/v1/attendance/check-out ───────────────────────────────────────
const checkOut = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const today = getTodayStr();

    const result = checkOutSchema.safeParse(req.body);
    if (!result.success) {
      return sendError(res, 400, 'Validation failed.', result.error.issues);
    }
    const { note } = result.data;

    const record = await Attendance.findOne({ employee: employeeId, date: today });

    if (!record || !record.checkIn) {
      return sendError(res, 400, 'You have not checked in today. Cannot check out.');
    }
    if (record.checkOut) {
      return sendError(res, 409, 'You have already checked out today.');
    }

    const now = new Date();
    const durationMinutes = Math.floor((now - record.checkIn) / 60000);

    // Half-day: less than 4 hours (240 minutes) worked
    record.checkOut = now;
    record.duration = durationMinutes;
    record.status = durationMinutes < 240 ? 'half-day' : 'present';
    if (note) record.note = note;

    await record.save();

    return sendSuccess(res, 200, 'Checked out successfully.', { attendance: record });
  } catch (err) {
    console.error('[attendance/checkOut]', err);
    return sendError(res, 500, 'Server error.');
  }
};

// ─── GET /api/v1/attendance/me ───────────────────────────────────────────────
const getMyAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ employee: req.user.id })
      .sort({ date: -1 })
      .limit(60);
    return sendSuccess(res, 200, 'Attendance records fetched.', { records });
  } catch (err) {
    console.error('[attendance/getMyAttendance]', err);
    return sendError(res, 500, 'Server error.');
  }
};

// ─── GET /api/v1/attendance/me/today ────────────────────────────────────────
const getMyToday = async (req, res) => {
  try {
    const today = getTodayStr();
    const record = await Attendance.findOne({ employee: req.user.id, date: today });
    return sendSuccess(res, 200, "Today's attendance fetched.", { record: record || null });
  } catch (err) {
    console.error('[attendance/getMyToday]', err);
    return sendError(res, 500, 'Server error.');
  }
};

// ─── GET /api/v1/attendance/me/week ─────────────────────────────────────────
const getMyWeek = async (req, res) => {
  try {
    const { start, end } = getWeekRange();
    const records = await Attendance.find({
      employee: req.user.id,
      date: { $gte: start, $lte: end },
    }).sort({ date: 1 });
    return sendSuccess(res, 200, 'Weekly attendance fetched.', { records, weekStart: start, weekEnd: end });
  } catch (err) {
    console.error('[attendance/getMyWeek]', err);
    return sendError(res, 500, 'Server error.');
  }
};

// ─── GET /api/v1/attendance  (Admin/HR) ──────────────────────────────────────
const getAllAttendance = async (req, res) => {
  try {
    const { date, employeeId, week } = req.query;
    const query = {};

    if (date) {
      query.date = date; // exact day: '2026-08-22'
    } else if (week) {
      // week = any date inside the desired week, e.g. '2026-08-19'
      const { start, end } = getWeekRange(new Date(week));
      query.date = { $gte: start, $lte: end };
    }

    if (employeeId) query.employee = employeeId;

    const records = await Attendance.find(query)
      .populate('employee', 'name email department role')
      .sort({ date: -1, createdAt: -1 })
      .limit(500);

    return sendSuccess(res, 200, 'All attendance records fetched.', { records });
  } catch (err) {
    console.error('[attendance/getAllAttendance]', err);
    return sendError(res, 500, 'Server error.');
  }
};

// ─── GET /api/v1/attendance/employee/:id  (Admin/HR) ─────────────────────────
const getEmployeeAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const records = await Attendance.find({ employee: id })
      .populate('employee', 'name email department role')
      .sort({ date: -1 })
      .limit(60);
    return sendSuccess(res, 200, 'Employee attendance fetched.', { records });
  } catch (err) {
    console.error('[attendance/getEmployeeAttendance]', err);
    return sendError(res, 500, 'Server error.');
  }
};

module.exports = {
  checkIn,
  checkOut,
  getMyAttendance,
  getMyToday,
  getMyWeek,
  getAllAttendance,
  getEmployeeAttendance,
};
