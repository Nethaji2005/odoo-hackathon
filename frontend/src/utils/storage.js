import {
  initialActivities,
  initialAdmins,
  initialAttendance,
  initialLeaveRequests,
  initialPayroll,
  initialUsers,
} from "./mockData";

const USERS_KEY = "dayflow_users";
const ATTENDANCE_KEY = "dayflow_attendance";
const LEAVE_KEY = "dayflow_leave";
const PAYROLL_KEY = "dayflow_payroll";
const ACTIVITIES_KEY = "dayflow_activities";

function readJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function shouldResetUsers(users) {
  if (!Array.isArray(users) || users.length === 0) {
    return true;
  }

  return users.some((item) => "emailVerified" in item || !("verified" in item));
}

export function initializeStorage() {
  const existingUsers = readJson(USERS_KEY);

  if (shouldResetUsers(existingUsers)) {
    writeJson(USERS_KEY, [...initialUsers, ...initialAdmins]);
    writeJson(ATTENDANCE_KEY, initialAttendance);
    writeJson(LEAVE_KEY, initialLeaveRequests);
    writeJson(PAYROLL_KEY, initialPayroll);
    writeJson(ACTIVITIES_KEY, initialActivities);
    return;
  }

  if (!localStorage.getItem(ATTENDANCE_KEY)) {
    writeJson(ATTENDANCE_KEY, initialAttendance);
  }

  if (!localStorage.getItem(LEAVE_KEY)) {
    writeJson(LEAVE_KEY, initialLeaveRequests);
  }

  if (!localStorage.getItem(PAYROLL_KEY)) {
    writeJson(PAYROLL_KEY, initialPayroll);
  }

  if (!localStorage.getItem(ACTIVITIES_KEY)) {
    writeJson(ACTIVITIES_KEY, initialActivities);
  }
}

export function getUsers() {
  return readJson(USERS_KEY) || [];
}

export function saveUsers(users) {
  writeJson(USERS_KEY, users);
}

export function getAttendance() {
  return readJson(ATTENDANCE_KEY) || [];
}

export function saveAttendance(data) {
  writeJson(ATTENDANCE_KEY, data);
}

export function getLeaveRequests() {
  return readJson(LEAVE_KEY) || [];
}

export function saveLeaveRequests(data) {
  writeJson(LEAVE_KEY, data);
}

export function getPayroll() {
  return readJson(PAYROLL_KEY) || [];
}

export function savePayroll(data) {
  writeJson(PAYROLL_KEY, data);
}

export function getActivities() {
  return readJson(ACTIVITIES_KEY) || [];
}

export function saveActivities(data) {
  writeJson(ACTIVITIES_KEY, data);
}

export function addActivity(employeeId, title, description) {
  const activities = getActivities();

  saveActivities([
    {
      id: Date.now(),
      employeeId,
      title,
      description,
    },
    ...activities,
  ]);
}