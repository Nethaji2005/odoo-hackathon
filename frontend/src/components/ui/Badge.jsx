const VARIANTS = {
  present:  { bg: '#052e16', border: '#166534', text: '#4ade80' },
  absent:   { bg: '#450a0a', border: '#991b1b', text: '#f87171' },
  'half-day': { bg: '#431407', border: '#9a3412', text: '#fb923c' },
  leave:    { bg: '#1e1b4b', border: '#4338ca', text: '#818cf8' },
  pending:  { bg: '#1c1917', border: '#57534e', text: '#a8a29e' },
  approved: { bg: '#052e16', border: '#166534', text: '#4ade80' },
  rejected: { bg: '#450a0a', border: '#991b1b', text: '#f87171' },
  paid:     { bg: '#042f2e', border: '#0f766e', text: '#2dd4bf' },
  sick:     { bg: '#1e1b4b', border: '#4338ca', text: '#818cf8' },
  unpaid:   { bg: '#1c1917', border: '#57534e', text: '#a8a29e' },
}

export default function Badge({ status }) {
  const v = VARIANTS[status?.toLowerCase()] ?? VARIANTS.pending
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize"
      style={{ background: v.bg, borderColor: v.border, color: v.text }}
    >
      {status}
    </span>
  )
}
