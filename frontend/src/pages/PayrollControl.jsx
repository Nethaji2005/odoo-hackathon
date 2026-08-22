import { useState } from "react";

import Layout from "../components/layout/Layout";

import { getPayroll, savePayroll, getUsers } from "../utils/storage";

function PayrollControl() {
  const [payroll, setPayroll] = useState(getPayroll());

  const employees = getUsers().filter((user) => user.role === "employee");

  const updateValue = (employeeId, field, value) => {
    setPayroll((previous) =>
      previous.map((item) =>
        item.employeeId === employeeId
          ? {
              ...item,
              [field]: Number(value),
            }
          : item
      )
    );
  };

  const save = () => {
    savePayroll(payroll);

    alert("Payroll changes saved successfully.");
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Payroll Control</h1>

          <p>Manage employee salary structures.</p>
        </div>
      </div>

      <section className="content-card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Base</th>
                <th>Allowances</th>
                <th>Deductions</th>
                <th>Net Pay</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((employee) => {
                const record = payroll.find((item) => item.employeeId === employee.id) || {
                  employeeId: employee.id,
                  base: 0,
                  allowances: 0,
                  deductions: 0,
                };

                const net = Number(record.base) + Number(record.allowances) - Number(record.deductions);

                return (
                  <tr key={employee.id}>
                    <td>
                      <strong>{employee.name}</strong>
                      <small>{employee.id}</small>
                    </td>

                    <td>
                      <input
                        className="table-input number-input"
                        type="number"
                        value={record.base}
                        onChange={(e) => updateValue(employee.id, "base", e.target.value)}
                      />
                    </td>

                    <td>
                      <input
                        className="table-input number-input"
                        type="number"
                        value={record.allowances}
                        onChange={(e) => updateValue(employee.id, "allowances", e.target.value)}
                      />
                    </td>

                    <td>
                      <input
                        className="table-input number-input"
                        type="number"
                        value={record.deductions}
                        onChange={(e) => updateValue(employee.id, "deductions", e.target.value)}
                      />
                    </td>

                    <td>
                      <strong>₹{net.toLocaleString()}</strong>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="save-row">
          <button className="primary-button" onClick={save}>
            Save Payroll
          </button>
        </div>
      </section>
    </Layout>
  );
}

export default PayrollControl;