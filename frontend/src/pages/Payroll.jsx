import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { getMyPayroll, getPayroll, createPayroll, updatePayroll } from "../services/payrollService.js";
import SalaryCard from "../components/payroll/SalaryCard.jsx";
import SalaryBreakdown from "../components/payroll/SalaryBreakdown.jsx";
import PayrollForm from "../components/payroll/PayrollForm.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import ErrorMessage from "../components/common/ErrorMessage.jsx";

/**
 * Payroll Page
 *
 * Routes:
 *   /payroll                  → employee views own payroll (read-only)
 *   /payroll/:employeeId      → admin/hr manages employee's payroll
 *
 * Employee: read-only view of SalaryCard + SalaryBreakdown.
 * Admin/HR: SalaryCard + SalaryBreakdown + PayrollForm for editing.
 */
export default function Payroll() {
  const { employeeId } = useParams();
  const { user } = useAuth();

  const isAdmin = user?.role === "admin" || user?.role === "hr";
  const isViewingOther = isAdmin && !!employeeId;

  const [payroll, setPayroll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchPayroll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = isViewingOther
        ? await getPayroll(employeeId)
        : await getMyPayroll();
      setPayroll(data);
    } catch (err) {
      // 404 means no payroll yet — not an error for admin (they can create)
      if (err.message?.includes("not found") || err.message?.includes("No payroll")) {
        setPayroll(null);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [employeeId, isViewingOther]);

  useEffect(() => {
    fetchPayroll();
  }, [fetchPayroll]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleSave = async (formData) => {
    setSaving(true);
    setError(null);
    try {
      const targetId = isViewingOther ? employeeId : user?.id;
      let updated;
      if (!payroll) {
        // Create
        updated = await createPayroll(targetId, formData);
      } else {
        // Update
        updated = await updatePayroll(targetId, formData);
      }
      setPayroll(updated);
      showSuccess(payroll ? "Payroll updated successfully" : "Payroll created successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen" style={{ background: "var(--color-surface)" }}>
      <LoadingSpinner message="Loading payroll…" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen" style={{ background: "var(--color-surface)" }}>
      <ErrorMessage message={error} onRetry={fetchPayroll} />
    </div>
  );

  const noPayrollYet = !payroll;

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: "var(--color-surface)" }}>
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-200">
            {isViewingOther ? "Employee Payroll" : "My Payroll"}
          </h1>
          {isAdmin && (
            <span className="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded-full font-medium">
              Admin View
            </span>
          )}
        </div>

        {/* Banners */}
        {successMsg && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg">
            ✓ {successMsg}
          </div>
        )}

        {/* No payroll yet */}
        {noPayrollYet && !isAdmin && (
          <div className="card text-center py-12">
            <p className="text-slate-400">Payroll has not been set up for your account yet.</p>
            <p className="text-slate-500 text-sm mt-1">Please contact HR to configure your salary.</p>
          </div>
        )}

        {/* Employee — read only */}
        {!isAdmin && payroll && (
          <div className="space-y-5">
            <SalaryCard payroll={payroll} />
            <SalaryBreakdown payroll={payroll} />
          </div>
        )}

        {/* Admin — full view + edit form */}
        {isAdmin && (
          <div className="space-y-5">
            {payroll && (
              <>
                <SalaryCard payroll={payroll} />
                <SalaryBreakdown payroll={payroll} />
              </>
            )}

            {noPayrollYet && (
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm px-4 py-3 rounded-lg">
                No payroll record found for this employee. Create one below.
              </div>
            )}

            <PayrollForm
              payroll={payroll}
              onSave={handleSave}
              saving={saving}
              isCreating={noPayrollYet}
            />
          </div>
        )}

        {/* Employee info footer */}
        {payroll?.employee && (
          <div className="card flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {payroll.employee.firstName?.[0]}{payroll.employee.lastName?.[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                {payroll.employee.firstName} {payroll.employee.lastName}
              </p>
              <p className="text-xs text-slate-400">{payroll.employee.jobTitle} · {payroll.employee.department}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-slate-500">{payroll.employee.employeeId}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
