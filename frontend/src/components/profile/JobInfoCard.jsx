import { useState } from "react";

function Field({ label, value, name, editable, onChange, type = "text" }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      {editable ? (
        <input
          type={type}
          name={name}
          defaultValue={value ?? ""}
          onChange={(e) => onChange?.(name, e.target.value)}
          className="form-input"
        />
      ) : (
        <p className="text-sm text-white py-2 px-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
          {value || <span className="text-slate-500">—</span>}
        </p>
      )}
    </div>
  );
}

/**
 * JobInfoCard — Displays job/employment information.
 *
 * Employees see this as read-only.
 * Admins can edit all fields and save.
 */
export default function JobInfoCard({ employee, isAdmin, onSave, saving }) {
  const [changes, setChanges] = useState({});

  const handleChange = (field, value) => {
    setChanges((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.(changes);
  };

  const hasChanges = Object.keys(changes).length > 0;

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Job Information</h2>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">Admin</span>
            {hasChanges && (
              <button type="submit" disabled={saving} className="btn-primary text-xs">
                {saving ? "Saving…" : "Save"}
              </button>
            )}
          </div>
        )}
        {!isAdmin && (
          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">Read-only</span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Employee ID" name="employeeId" value={employee.employeeId} editable={false} />
        <Field label="Department" name="department" value={employee.department} editable={isAdmin} onChange={handleChange} />
        <Field label="Job Title" name="jobTitle" value={employee.jobTitle} editable={isAdmin} onChange={handleChange} />
        <Field
          label="Employment Type"
          name="employmentType"
          value={employee.employmentType?.replace("_", " ")}
          editable={false}
        />
        <Field
          label="Joining Date"
          name="joiningDate"
          value={employee.joiningDate ? employee.joiningDate.slice(0, 10) : ""}
          editable={isAdmin}
          onChange={handleChange}
          type="date"
        />
        <Field label="Work Location" name="workLocation" value={employee.workLocation} editable={isAdmin} onChange={handleChange} />
        <Field
          label="Reporting Manager"
          name="manager"
          value={
            employee.manager
              ? `${employee.manager.firstName} ${employee.manager.lastName} (${employee.manager.employeeId})`
              : "—"
          }
          editable={false}
        />

        {/* Status — admin can change */}
        {isAdmin ? (
          <div>
            <label className="form-label">Status</label>
            <select
              name="status"
              defaultValue={employee.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="form-input"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on_leave">On Leave</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
        ) : (
          <Field label="Status" value={employee.status?.replace("_", " ")} editable={false} />
        )}
      </div>
    </form>
  );
}
