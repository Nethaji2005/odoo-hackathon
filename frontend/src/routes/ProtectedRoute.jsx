import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/**
 * Wraps a route so only authenticated users can access it.
 * If `requiredRole` is 'admin' or 'hr', non-admin employees are redirected.
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-base)' }}>
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (requiredRole === 'admin' && user.role !== 'admin' && user.role !== 'hr') {
    return <Navigate to="/attendance" replace />
  }

  return children
}
