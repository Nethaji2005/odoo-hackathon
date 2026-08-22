import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Layout from "../components/layout/Layout";

import { getUsers, saveUsers } from "../utils/storage";

import { useAuth } from "../context/AuthContext";

function Profile() {
  const { user, updateCurrentUser } = useAuth();

  const [searchParams] = useSearchParams();

  const employeeId = searchParams.get("employeeId");

  const users = getUsers();

  const profileUser = useMemo(() => {
    if (user.role === "admin" && employeeId) {
      return users.find((item) => item.id === employeeId) || user;
    }

    return user;
  }, [users, user, employeeId]);

  const isAdminViewingEmployee = user.role === "admin" && profileUser.id !== user.id;

  const canEditAll = user.role === "admin";

  const [editing, setEditing] = useState(false);

  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: profileUser.name || "",
    email: profileUser.email || "",
    department: profileUser.department || "",
    designation: profileUser.designation || "",
    status: profileUser.status || "Active",
    phone: profileUser.phone || "",
    address: profileUser.address || "",
    joiningDate: profileUser.jobDetails?.joiningDate || "",
    employmentType: profileUser.jobDetails?.employmentType || "",
    manager: profileUser.jobDetails?.manager || "",
    base: profileUser.salary?.base || 0,
    allowances: profileUser.salary?.allowances || 0,
    deductions: profileUser.salary?.deductions || 0,
  });

  const update = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSave = () => {
    const updates = {
      name: form.name,
      email: form.email,
      department: form.department,
      designation: form.designation,
      status: form.status,
      phone: form.phone,
      address: form.address,
      jobDetails: {
        joiningDate: form.joiningDate,
        employmentType: form.employmentType,
        manager: form.manager,
      },
      salary: {
        base: Number(form.base),
        allowances: Number(form.allowances),
        deductions: Number(form.deductions),
      },
    };

    if (profileUser.id === user.id) {
      updateCurrentUser(updates);
    } else {
      const allUsers = getUsers();

      const updatedUsers = allUsers.map((item) =>
        item.id === profileUser.id
          ? {
              ...item,
              ...updates,
            }
          : item
      );

      saveUsers(updatedUsers);
    }

    setEditing(false);
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  const cancelEdit = () => {
    setEditing(false);

    setForm({
      name: profileUser.name || "",
      email: profileUser.email || "",
      department: profileUser.department || "",
      designation: profileUser.designation || "",
      status: profileUser.status || "Active",
      phone: profileUser.phone || "",
      address: profileUser.address || "",
      joiningDate: profileUser.jobDetails?.joiningDate || "",
      employmentType: profileUser.jobDetails?.employmentType || "",
      manager: profileUser.jobDetails?.manager || "",
      base: profileUser.salary?.base || 0,
      allowances: profileUser.salary?.allowances || 0,
      deductions: profileUser.salary?.deductions || 0,
    });
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Profile</h1>

          <p>{isAdminViewingEmployee ? `Viewing ${profileUser.name}` : "Manage your personal information."}</p>
        </div>

        {!editing ? (
          <button className="primary-button" onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        ) : (
          <div className="button-group">
            <button className="secondary-button" onClick={cancelEdit}>
              Cancel
            </button>

            <button className="primary-button" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        )}
      </div>

      {saved && <div className="success-message">Profile updated successfully.</div>}

      <div className="profile-layout">
        <section className="content-card profile-summary">
          <div className="profile-avatar">{profileUser.name?.charAt(0).toUpperCase()}</div>

          <h2>{profileUser.name}</h2>

          <p>{profileUser.designation}</p>

          <span className="status-badge success">{profileUser.status}</span>

          <div className="profile-id">
            Employee ID: <strong>{profileUser.id}</strong>
          </div>
        </section>

        <section className="content-card">
          <div className="section-title">Personal Information</div>

          <div className="form-grid">
            <ProfileField label="Name" value={form.name} editing={editing && canEditAll} onChange={(value) => update("name", value)} />

            <ProfileField label="Email" value={form.email} editing={editing && canEditAll} onChange={(value) => update("email", value)} />

            <ProfileField label="Phone" value={form.phone} editing={editing} onChange={(value) => update("phone", value)} />

            <ProfileField label="Address" value={form.address} editing={editing} onChange={(value) => update("address", value)} />

            <ProfileField
              label="Role"
              value={profileUser.role === "admin" ? "HR / Admin" : "Employee"}
              editing={false}
            />

            <ProfileField label="Department" value={form.department} editing={editing && canEditAll} onChange={(value) => update("department", value)} />

            <ProfileField label="Designation" value={form.designation} editing={editing && canEditAll} onChange={(value) => update("designation", value)} />

            <ProfileField label="Status" value={form.status} editing={editing && canEditAll} onChange={(value) => update("status", value)} />
          </div>
        </section>
      </div>

      <section className="content-card">
        <div className="section-title">Job Details</div>

        <div className="form-grid">
          <ProfileField label="Joining Date" value={form.joiningDate} editing={editing && canEditAll} type="date" onChange={(value) => update("joiningDate", value)} />

          <ProfileField label="Employment Type" value={form.employmentType} editing={editing && canEditAll} onChange={(value) => update("employmentType", value)} />

          <ProfileField label="Manager" value={form.manager} editing={editing && canEditAll} onChange={(value) => update("manager", value)} />
        </div>
      </section>

      <section className="content-card">
        <div className="section-title">Salary Structure</div>

        <div className="form-grid">
          <ProfileField label="Base Salary" value={form.base} editing={editing && canEditAll} type="number" onChange={(value) => update("base", value)} />

          <ProfileField label="Allowances" value={form.allowances} editing={editing && canEditAll} type="number" onChange={(value) => update("allowances", value)} />

          <ProfileField label="Deductions" value={form.deductions} editing={editing && canEditAll} type="number" onChange={(value) => update("deductions", value)} />

          <div className="field">
            <label>Net Salary</label>

            <div className="readonly-value">₹{Number(form.base) + Number(form.allowances) - Number(form.deductions)}</div>
          </div>
        </div>
      </section>

      <section className="content-card">
        <div className="section-title">Documents</div>

        <div className="document-list">
          {(profileUser.documents || []).length === 0 ? (
            <div className="empty-state">No documents uploaded.</div>
          ) : (
            profileUser.documents.map((document) => (
              <div className="document-item" key={document}>
                <span>📄</span>
                {document}
              </div>
            ))
          )}
        </div>
      </section>

      <section className="content-card">
        <div className="section-title">Profile Picture</div>

        <div className="profile-picture-box">
          <div className="large-avatar">{profileUser.name?.charAt(0).toUpperCase()}</div>

          <div>
            <strong>Profile Picture</strong>

            <p>Employees can manage their profile picture here.</p>

            {editing && <button className="secondary-button">Upload Picture</button>}
          </div>
        </div>
      </section>
    </Layout>
  );
}

function ProfileField({ label, value, editing, onChange, type = "text" }) {
  return (
    <div className="field">
      <label>{label}</label>

      {editing ? (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <div className="readonly-value">{value || "Not provided"}</div>
      )}
    </div>
  );
}

export default Profile;