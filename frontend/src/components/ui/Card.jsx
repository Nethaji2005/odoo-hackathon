export default function Card({ children, className = '' }) {
  return (
    <div
      className={`rounded-2xl border p-6 ${className}`}
      style={{ background: 'var(--color-bg-card)', borderColor: 'var(--color-border)' }}
    >
      {children}
    </div>
  )
}
