import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../context/ToastContext'
import Button from '../components/ui/Button'

export default function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const { login } = useAuth()
  const toast     = useToast()
  const navigate  = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please enter your email and password.')
      return
    }
    setLoading(true)
    try {
      const user = await login(email, password)
      toast.success(`Welcome back, ${user.name}!`)
      navigate(user.role === 'admin' || user.role === 'hr' ? '/admin/attendance' : '/attendance')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--color-bg-base)' }}
    >
      {/* Card */}
      <div
        className="w-full max-w-md rounded-2xl border shadow-2xl animate-fade-in"
        style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)' }}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
            style={{ background: 'var(--color-primary)' }}
          >
            ⚡
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-base)' }}>
            Dayflow HRMS
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Sign in to your account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-base"
              style={{
                background: 'var(--color-bg-base)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-base)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-base"
              style={{
                background: 'var(--color-bg-base)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-base)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
            />
          </div>

          <Button type="submit" loading={loading} className="w-full py-3 text-base">
            Sign in
          </Button>
        </form>

        {/* Demo credentials hint */}
        <div className="px-8 pb-7">
          <div
            className="rounded-xl px-4 py-3 text-xs space-y-1 border"
            style={{ background: 'var(--color-bg-base)', borderColor: 'var(--color-border)', color: 'var(--color-text-dim)' }}
          >
            <p className="font-semibold" style={{ color: 'var(--color-text-muted)' }}>Demo credentials</p>
            <p>Admin: admin@dayflow.com / admin123</p>
            <p>Employee: employee@dayflow.com / emp123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
