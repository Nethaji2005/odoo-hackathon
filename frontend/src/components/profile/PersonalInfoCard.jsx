import { useState } from "react";

/**
 * Field — individual form row, read-only or editable depending on props.
 */
function Field({ label, name, value, type = "text", editable, onChange }) {
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
 * PersonalInfoCard — personal + contact information.
 *
 * Employees can edit: phone, address, emergencyContact.
 * Admins can edit all fields shown here.
 */
export default function PersonalInfoCard({ employee, isAdmin, onSave, saving }) {
  const canEditPersonal = isAdmin;
  const canEditContact = true; // both employee and admin

  const [changes, setChanges] = useState({});

  const handleChange = (field, value) => {
    setChanges((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field, value) => {
    setChanges((prev) => ({
      ...prev,
      address: { ...(prev.address ?? employee.address ?? {}), [field]: value },
    }));
  };

  const handleEmergencyChange = (field, value) => {
    setChanges((prev) => ({
      ...prev,
      emergencyContact: {
        ...(prev.emergencyContact ?? employee.emergencyContact ?? {}),
        [field]: value,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.(changes);
  };

  const hasChanges = Object.keys(changes).length > 0;

  return (
    <form onSubmit={handleSubmit} className="card space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Personal Information</h2>
        {hasChanges && (
          <button type="submit" disabled={saving} className="btn-primary text-xs">
            {saving ? "Saving…" : "Save changes"}
          </button>
        )}
      </div>

      {/* Personal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="First Name" name="firstName" value={employee.firstName} editable={canEditPersonal} onChange={handleChange} />
        <Field label="Last Name" name="lastName" value={employee.lastName} editable={canEditPersonal} onChange={handleChange} />
        <Field label="Email" name="email" value={employee.email} editable={isAdmin} onChange={handleChange} type="email" />
        <Field label="Phone" name="phone" value={employee.phone} editable={canEditContact} onChange={handleChange} />
        <Field label="Date of Birth" name="dateOfBirth" value={employee.dateOfBirth ? employee.dateOfBirth.slice(0, 10) : ""} editable={canEditPersonal} onChange={handleChange} type="date" />
        <Field label="Gender" name="gender" value={employee.gender} editable={canEditPersonal} onChange={handleChange} />
      </div>

      {/* Address */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Address</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Street" name="street" value={employee.address?.street} editable={canEditContact} onChange={(_, v) => handleAddressChange("street", v)} />
          <Field label="City" name="city" value={employee.address?.city} editable={canEditContact} onChange={(_, v) => handleAddressChange("city", v)} />
          <Field label="State" name="state" value={employee.address?.state} editable={canEditContact} onChange={(_, v) => handleAddressChange("state", v)} />
          <Field label="Postal Code" name="postalCode" value={employee.address?.postalCode} editable={canEditContact} onChange={(_, v) => handleAddressChange("postalCode", v)} />
        </div>
      </div>

      {/* Emergency Contact */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Emergency Contact</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Name" name="ecName" value={employee.emergencyContact?.name} editable={canEditContact} onChange={(_, v) => handleEmergencyChange("name", v)} />
          <Field label="Phone" name="ecPhone" value={employee.emergencyContact?.phone} editable={canEditContact} onChange={(_, v) => handleEmergencyChange("phone", v)} />
        </div>
      </div>
    </form>
  );
}
