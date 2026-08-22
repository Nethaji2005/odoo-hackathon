/**
 * SalaryCard — displays net salary prominently.
 */
export default function SalaryCard({ payroll }) {
  const fmt = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: payroll?.currency ?? "INR",
      maximumFractionDigits: 0,
    }).format(n ?? 0);

  return (
    <div
      className="card relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #312e81 0%, #1e1b4b 60%, #0f172a 100%)",
        border: "1px solid #4338ca",
      }}
    >
      {/* Decorative ring */}
      <div
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #818cf8, transparent)" }}
      />

      <p className="text-xs font-semibold uppercase tracking-widest text-indigo-300">
        Net Salary
      </p>
      <p className="text-4xl font-bold text-white mt-2">{fmt(payroll?.netSalary)}</p>

      <div className="mt-4 flex gap-6 text-sm">
        <div>
          <p className="text-indigo-300 text-xs">Frequency</p>
          <p className="text-white font-medium capitalize">
            {payroll?.payFrequency?.replace("_", " ") ?? "—"}
          </p>
        </div>
        <div>
          <p className="text-indigo-300 text-xs">Structure</p>
          <p className="text-white font-medium capitalize">{payroll?.salaryStructure ?? "—"}</p>
        </div>
        <div>
          <p className="text-indigo-300 text-xs">Effective From</p>
          <p className="text-white font-medium">
            {payroll?.effectiveDate
              ? new Date(payroll.effectiveDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
              : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
