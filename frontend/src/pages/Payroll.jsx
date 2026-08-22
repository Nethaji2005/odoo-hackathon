import Layout from "../components/layout/Layout";

import { useAuth } from "../context/AuthContext";

import { getPayroll } from "../utils/storage";

function Payroll() {
  const { user } = useAuth();

  const payroll = getPayroll().find((item) => item.employeeId === user.id);

  const base = payroll?.base || 0;

  const allowances = payroll?.allowances || 0;

  const deductions = payroll?.deductions || 0;

  const net = base + allowances - deductions;

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Payroll</h1>

          <p>View your salary information.</p>
        </div>
      </div>

      <section className="content-card">
        <div className="card-heading">
          <div>
            <h2>Salary Summary</h2>

            <p>Read-only payroll information.</p>
          </div>
        </div>

        <div className="payroll-grid">
          <div className="payroll-item">
            <span>Base Salary</span>
            <strong>₹{base.toLocaleString()}</strong>
          </div>

          <div className="payroll-item">
            <span>Allowances</span>
            <strong>₹{allowances.toLocaleString()}</strong>
          </div>

          <div className="payroll-item">
            <span>Deductions</span>
            <strong>₹{deductions.toLocaleString()}</strong>
          </div>

          <div className="payroll-item highlight">
            <span>Net Pay</span>
            <strong>₹{net.toLocaleString()}</strong>
          </div>
        </div>
      </section>

      <section className="content-card">
        <div className="section-title">Payroll Access</div>

        <p className="muted-text">
          Employees can view payroll information but cannot edit salary values.
        </p>
      </section>
    </Layout>
  );
}

export default Payroll;