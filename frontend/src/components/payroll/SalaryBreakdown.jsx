/**
 * SalaryBreakdown — shows the full salary breakdown table.
 * Displays: Basic → + Allowances → Gross → - Deductions → Net
 */
export default function SalaryBreakdown({ payroll }) {
  const currency = payroll?.currency ?? "INR";

  const fmt = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n ?? 0);

  const totalAllowances = (payroll?.allowances ?? []).reduce((s, a) => s + a.amount, 0);
  const totalDeductions = (payroll?.deductions ?? []).reduce((s, d) => s + d.amount, 0);

  return (
    <div className="card space-y-4">
      <h2 className="text-lg font-semibold text-white">Salary Breakdown</h2>

      {/* Basic */}
      <div className="flex items-center justify-between py-2.5 border-b border-slate-700/50">
        <span className="text-sm text-slate-300 font-medium">Basic Salary</span>
        <span className="text-sm text-white font-semibold">{fmt(payroll?.basicSalary)}</span>
      </div>

      {/* Allowances */}
      {(payroll?.allowances?.length ?? 0) > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs uppercase tracking-widest text-green-400 font-semibold">Allowances</p>
          {payroll.allowances.map((a, i) => (
            <div key={i} className="flex items-center justify-between px-2 py-1.5 rounded bg-green-500/5">
              <span className="text-sm text-slate-300">{a.name}</span>
              <span className="text-sm text-green-400">+ {fmt(a.amount)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between px-2 py-1 border-t border-slate-700/50">
            <span className="text-xs text-slate-400">Total Allowances</span>
            <span className="text-xs text-green-400 font-semibold">+ {fmt(totalAllowances)}</span>
          </div>
        </div>
      )}

      {/* Gross */}
      <div className="flex items-center justify-between py-2.5 bg-slate-800/60 rounded-lg px-3 border border-slate-600/30">
        <span className="text-sm font-semibold text-slate-200">Gross Salary</span>
        <span className="text-sm font-bold text-white">{fmt(payroll?.grossSalary)}</span>
      </div>

      {/* Deductions */}
      {(payroll?.deductions?.length ?? 0) > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs uppercase tracking-widest text-red-400 font-semibold">Deductions</p>
          {payroll.deductions.map((d, i) => (
            <div key={i} className="flex items-center justify-between px-2 py-1.5 rounded bg-red-500/5">
              <span className="text-sm text-slate-300">{d.name}</span>
              <span className="text-sm text-red-400">- {fmt(d.amount)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between px-2 py-1 border-t border-slate-700/50">
            <span className="text-xs text-slate-400">Total Deductions</span>
            <span className="text-xs text-red-400 font-semibold">- {fmt(totalDeductions)}</span>
          </div>
        </div>
      )}

      {/* Net */}
      <div
        className="flex items-center justify-between py-3 px-4 rounded-xl border"
        style={{ background: "linear-gradient(90deg,#1e1b4b,#0f172a)", borderColor: "#4338ca" }}
      >
        <span className="text-base font-bold text-indigo-200">Net Salary</span>
        <span className="text-xl font-black text-white">{fmt(payroll?.netSalary)}</span>
      </div>
    </div>
  );
}
