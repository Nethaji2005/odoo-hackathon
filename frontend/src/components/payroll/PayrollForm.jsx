import { useState } from "react";

const EMPTY_PAYROLL = {
  salaryStructure: "standard",
  basicSalary: "",
  allowances: [{ name: "HRA", amount: "" }],
  deductions: [{ name: "Professional Tax", amount: "" }],
  payFrequency: "monthly",
  currency: "INR",
  effectiveDate: "",
};

/**
 * PayrollForm — Admin/HR edits payroll.
 * Shows live gross/net calculation preview.
 */
export default function PayrollForm({ payroll, onSave, saving, isCreating }) {
  const [form, setForm] = useState({
    salaryStructure: payroll?.salaryStructure ?? "standard",
    basicSalary: payroll?.basicSalary ?? "",
    allowances: payroll?.allowances?.length ? payroll.allowances : EMPTY_PAYROLL.allowances,
    deductions: payroll?.deductions?.length ? payroll.deductions : EMPTY_PAYROLL.deductions,
    payFrequency: payroll?.payFrequency ?? "monthly",
    currency: payroll?.currency ?? "INR",
    effectiveDate: payroll?.effectiveDate ? payroll.effectiveDate.slice(0, 10) : "",
  });

  const [formError, setFormError] = useState("");

  // ── Live calculation ────────────────────────────────────────────────────────
  const totalAllowances = form.allowances.reduce((s, a) => s + (Number(a.amount) || 0), 0);
  const totalDeductions = form.deductions.reduce((s, d) => s + (Number(d.amount) || 0), 0);
  const gross = (Number(form.basicSalary) || 0) + totalAllowances;
  const net = gross - totalDeductions;

  const fmt = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: form.currency || "INR", maximumFractionDigits: 0 }).format(n);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const updateAllowance = (idx, field, val) => {
    const updated = form.allowances.map((a, i) => i === idx ? { ...a, [field]: val } : a);
    setForm({ ...form, allowances: updated });
  };

  const addAllowance = () =>
    setForm({ ...form, allowances: [...form.allowances, { name: "", amount: "" }] });

  const removeAllowance = (idx) =>
    setForm({ ...form, allowances: form.allowances.filter((_, i) => i !== idx) });

  const updateDeduction = (idx, field, val) => {
    const updated = form.deductions.map((d, i) => i === idx ? { ...d, [field]: val } : d);
    setForm({ ...form, deductions: updated });
  };

  const addDeduction = () =>
    setForm({ ...form, deductions: [...form.deductions, { name: "", amount: "" }] });

  const removeDeduction = (idx) =>
    setForm({ ...form, deductions: form.deductions.filter((_, i) => i !== idx) });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.basicSalary || Number(form.basicSalary) < 0) {
      setFormError("Basic salary is required and must be ≥ 0");
      return;
    }
    if (!form.effectiveDate) {
      setFormError("Effective date is required");
      return;
    }
    onSave?.({
      ...form,
      basicSalary: Number(form.basicSalary),
      allowances: form.allowances
        .filter((a) => a.name && a.amount !== "")
        .map((a) => ({ name: a.name, amount: Number(a.amount) })),
      deductions: form.deductions
        .filter((d) => d.name && d.amount !== "")
        .map((d) => ({ name: d.name, amount: Number(d.amount) })),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      <h2 className="text-lg font-semibold text-white">
        {isCreating ? "Set Up Payroll" : "Edit Payroll"}
      </h2>

      {formError && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
          {formError}
        </p>
      )}

      {/* Basic fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Salary Structure</label>
          <select
            className="form-input"
            value={form.salaryStructure}
            onChange={(e) => setForm({ ...form, salaryStructure: e.target.value })}
          >
            {["basic", "standard", "senior", "executive"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">Basic Salary ({form.currency})</label>
          <input
            type="number"
            min="0"
            step="1000"
            className="form-input"
            value={form.basicSalary}
            onChange={(e) => setForm({ ...form, basicSalary: e.target.value })}
          />
        </div>
        <div>
          <label className="form-label">Pay Frequency</label>
          <select
            className="form-input"
            value={form.payFrequency}
            onChange={(e) => setForm({ ...form, payFrequency: e.target.value })}
          >
            <option value="monthly">Monthly</option>
            <option value="bi_weekly">Bi-weekly</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
        <div>
          <label className="form-label">Currency</label>
          <input
            type="text"
            maxLength="3"
            className="form-input uppercase"
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })}
          />
        </div>
        <div>
          <label className="form-label">Effective Date</label>
          <input
            type="date"
            className="form-input"
            value={form.effectiveDate}
            onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })}
          />
        </div>
      </div>

      {/* Allowances */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="form-label mb-0">Allowances</label>
          <button type="button" onClick={addAllowance} className="text-xs text-indigo-400 hover:text-indigo-300">+ Add</button>
        </div>
        {form.allowances.map((a, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <input
              className="form-input flex-1"
              placeholder="Name (e.g. HRA)"
              value={a.name}
              onChange={(e) => updateAllowance(idx, "name", e.target.value)}
            />
            <input
              type="number"
              min="0"
              className="form-input w-32"
              placeholder="Amount"
              value={a.amount}
              onChange={(e) => updateAllowance(idx, "amount", e.target.value)}
            />
            <button type="button" onClick={() => removeAllowance(idx)} className="text-red-400 hover:text-red-300 px-1">✕</button>
          </div>
        ))}
      </div>

      {/* Deductions */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="form-label mb-0">Deductions</label>
          <button type="button" onClick={addDeduction} className="text-xs text-indigo-400 hover:text-indigo-300">+ Add</button>
        </div>
        {form.deductions.map((d, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <input
              className="form-input flex-1"
              placeholder="Name (e.g. Professional Tax)"
              value={d.name}
              onChange={(e) => updateDeduction(idx, "name", e.target.value)}
            />
            <input
              type="number"
              min="0"
              className="form-input w-32"
              placeholder="Amount"
              value={d.amount}
              onChange={(e) => updateDeduction(idx, "amount", e.target.value)}
            />
            <button type="button" onClick={() => removeDeduction(idx)} className="text-red-400 hover:text-red-300 px-1">✕</button>
          </div>
        ))}
      </div>

      {/* Live preview */}
      <div className="bg-slate-800/70 border border-slate-700 rounded-xl px-4 py-3 space-y-1.5">
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Preview</p>
        <div className="flex justify-between text-sm">
          <span className="text-slate-300">Gross</span>
          <span className="text-white font-medium">{fmt(gross)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-300">Net</span>
          <span className="text-indigo-300 font-bold text-base">{fmt(net)}</span>
        </div>
      </div>

      <button type="submit" disabled={saving} className="btn-primary w-full">
        {saving ? "Saving…" : isCreating ? "Create Payroll" : "Update Payroll"}
      </button>
    </form>
  );
}
