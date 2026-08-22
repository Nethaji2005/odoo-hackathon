require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Employee = require('./src/models/Employee');
const Payroll = require('./src/models/Payroll');
const Attendance = require('./src/models/Attendance');
const Leave = require('./src/models/Leave');

const API_URL = 'http://localhost:5000/api';
let adminToken = '';
let employeeToken = '';
let testAdminId = null;
let testEmployeeUserId = null;
let testEmployeeId = null;

async function request(endpoint, options = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

async function runTests() {
  console.log('--- Starting Integration Tests ---');
  let errors = 0;

  try {
    const health = await request('/health');
    console.log('[PASS] /api/health returns:', health.success);
  } catch (err) {
    console.error('[FAIL] /api/health:', err.message);
    errors++;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[PASS] MongoDB connected via Mongoose.');
  } catch (err) {
    console.error('[FAIL] MongoDB connection:', err.message);
    errors++;
    return;
  }

  const timestamp = Date.now();
  const testAdminEmail = `admin_${timestamp}@test.com`;
  const testEmployeeEmail = `employee_${timestamp}@test.com`;

  try {
    let res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Admin', email: testAdminEmail, password: 'password123', role: 'admin' })
    });
    testAdminId = res.data.user.id;
    adminToken = res.data.token;
    console.log('[PASS] Registered test admin.');

    res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Employee', email: testEmployeeEmail, password: 'password123', role: 'employee' })
    });
    testEmployeeUserId = res.data.user.id;
    employeeToken = res.data.token;
    console.log('[PASS] Registered test employee.');
  } catch (err) {
    console.error('[FAIL] Auth Registration:', err.message);
    errors++;
  }

  const adminHeaders = { Authorization: `Bearer ${adminToken}` };
  const empHeaders = { Authorization: `Bearer ${employeeToken}` };

  try {
    let res = await request('/employees', {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        user: testEmployeeUserId,
        employeeId: `EMP${timestamp}`,
        firstName: 'Test',
        lastName: 'Employee',
        email: testEmployeeEmail
      })
    });
    testEmployeeId = res.data.employee._id;
    console.log('[PASS] Admin created employee profile.');

    res = await request('/employees/me', { headers: empHeaders });
    console.log('[PASS] Employee fetched their profile:', res.data.employee._id === testEmployeeId);

    let failed = false;
    try {
      await request('/employees', {
        method: 'POST',
        headers: empHeaders,
        body: JSON.stringify({ employeeId: `EMP${timestamp + 1}`, firstName: 'Hacker', lastName: 'Man', email: 'hack@test.com' })
      });
    } catch (e) { failed = true; }
    if (failed) console.log('[PASS] Employee correctly forbidden from creating profiles.');
    else { console.error('[FAIL] Employee was able to create a profile.'); errors++; }
  } catch (err) {
    console.error('[FAIL] Employee operations:', err.message);
    errors++;
  }

  try {
    let res = await request(`/payroll/${testEmployeeId}`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ basicSalary: 50000, effectiveDate: new Date() })
    });
    console.log('[PASS] Admin created payroll.');

    res = await request('/payroll/me', { headers: empHeaders });
    console.log('[PASS] Employee fetched their payroll, grossSalary:', res.data.payroll.grossSalary);
  } catch (err) {
    console.error('[FAIL] Payroll operations:', err.message);
    errors++;
  }

  console.log('--- Cleaning up test data ---');
  if (testAdminId) await User.findByIdAndDelete(testAdminId);
  if (testEmployeeUserId) await User.findByIdAndDelete(testEmployeeUserId);
  if (testEmployeeId) {
    await Employee.findByIdAndDelete(testEmployeeId);
    await Payroll.findOneAndDelete({ employee: testEmployeeId });
  }
  
  await mongoose.disconnect();
  console.log('--- Cleanup complete ---');
  console.log(`Integration Test Result: ${errors === 0 ? 'PASS' : 'FAIL'} (${errors} errors)`);
}

runTests();
