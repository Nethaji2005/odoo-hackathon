import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getMyProfile, updateMyProfile, getEmployee, updateEmployee } from "../services/employeeService.js";
import ProfileHeader from "../components/profile/ProfileHeader.jsx";
import PersonalInfoCard from "../components/profile/PersonalInfoCard.jsx";
import JobInfoCard from "../components/profile/JobInfoCard.jsx";
import DocumentsSection from "../components/profile/DocumentsSection.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import ErrorMessage from "../components/common/ErrorMessage.jsx";

/**
 * EmployeeProfile Page
 *
 * Routes:
 *   /profile          → employee views own profile
 *   /profile/:id      → admin/hr views any employee's profile (uses getEmployee(id))
 *
 * Role behavior:
 *   employee → self-edit: phone, address, emergencyContact, profilePicture only
 *   admin/hr → full edit of all employee fields
 */
export default function EmployeeProfile() {
  const { id } = useParams(); // present when admin is viewing another employee
  const { user } = useAuth();

  const isAdmin = user?.role === "admin" || user?.role === "hr";
  const isViewingOther = isAdmin && !!id;

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchEmployee = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = isViewingOther ? await getEmployee(id) : await getMyProfile();
      setEmployee(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, isViewingOther]);

  useEffect(() => {
    fetchEmployee();
  }, [fetchEmployee]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handlePersonalSave = async (changes) => {
    if (!Object.keys(changes).length) return;
    setSaving(true);
    try {
      let updated;
      if (isViewingOther) {
        updated = await updateEmployee(id, changes);
      } else {
        updated = await updateMyProfile(changes);
      }
      setEmployee(updated);
      showSuccess("Personal information updated successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleJobSave = async (changes) => {
    if (!Object.keys(changes).length || !isAdmin) return;
    setSaving(true);
    try {
      const targetId = isViewingOther ? id : employee._id;
      const updated = await updateEmployee(targetId, changes);
      setEmployee(updated);
      showSuccess("Job information updated successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddDocument = async (docData) => {
    if (!isAdmin) return;
    setSaving(true);
    try {
      const targetId = isViewingOther ? id : employee._id;
      const updatedDocs = [...(employee.documents ?? []), docData];
      const updated = await updateEmployee(targetId, { documents: updatedDocs });
      setEmployee(updated);
      showSuccess("Document added successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePictureChange = (url) => {
    handlePersonalSave({ profilePicture: url });
  };

  if (loading) return (
    <div className="min-h-screen" style={{ background: "var(--color-surface)" }}>
      <LoadingSpinner message="Loading employee profile…" />
    </div>
  );

  if (error && !employee) return (
    <div className="min-h-screen" style={{ background: "var(--color-surface)" }}>
      <ErrorMessage message={error} onRetry={fetchEmployee} />
    </div>
  );

  if (!employee) return null;

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: "var(--color-surface)" }}>
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Page title */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-200">
            {isViewingOther ? "Employee Profile" : "My Profile"}
          </h1>
          {isAdmin && (
            <span className="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded-full font-medium">
              Admin View
            </span>
          )}
        </div>

        {/* Success / Error banners */}
        {successMsg && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg">
            ✓ {successMsg}
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Profile header */}
        <ProfileHeader
          employee={employee}
          isEditable={!isViewingOther || isAdmin}
          onPictureChange={handlePictureChange}
        />

        {/* Two-column layout on larger screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <PersonalInfoCard
            employee={employee}
            isAdmin={isAdmin}
            onSave={handlePersonalSave}
            saving={saving}
          />
          <JobInfoCard
            employee={employee}
            isAdmin={isAdmin}
            onSave={handleJobSave}
            saving={saving}
          />
        </div>

        {/* Documents */}
        <DocumentsSection
          documents={employee.documents}
          isAdmin={isAdmin}
          onAddDocument={handleAddDocument}
        />
      </div>
    </div>
  );
}
