import { Link } from "react-router-dom";
import Layout from "../components/layout/Layout";

import { getUsers } from "../utils/storage";

function Employees() {
  const employees = getUsers().filter((user) => user.role === "employee");

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Employees</h1>

          <p>Manage employee records.</p>
        </div>
      </div>

      <section className="content-card">
        <div className="card-heading">
          <div>
            <h2>Employee Directory</h2>

            <p>{employees.length} employees</p>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Employee ID</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td>
                    <strong>{employee.name}</strong>
                    <small>{employee.email}</small>
                  </td>

                  <td>{employee.id}</td>

                  <td>{employee.department}</td>

                  <td>{employee.designation}</td>

                  <td>
                    <span className="status-badge success">{employee.status}</span>
                  </td>

                  <td>
                    <Link to={`/profile?employeeId=${employee.id}`} className="small-button">
                      View / Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  );
}

export default Employees;