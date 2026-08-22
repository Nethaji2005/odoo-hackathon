const VARIANTS = {
  primary: {
    background: 'var(--color-primary)',
    color: 'white',
    hoverBg: 'var(--color-primary-hover)',
  },
  danger: {
    background: 'var(--color-danger)',
    color: 'white',
    hoverBg: '#dc2626',
  },
  success: {
    background: 'var(--color-success)',
    color: 'white',
    hoverBg: '#16a34a',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-text-muted)',
    border: '1px solid var(--color-border)',
    hoverBg: 'var(--color-bg-hover)',
  },
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
}) {
  const v = VARIANTS[variant] ?? VARIANTS.primary
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-base disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{ background: v.background, color: v.color, border: v.border }}
      onMouseEnter={e => { if (!disabled && !loading) e.currentTarget.style.background = v.hoverBg }}
      onMouseLeave={e => { e.currentTarget.style.background = v.background }}
    >
      {loading && (
        <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
      )}
      {children}
    </button>
  )
}
