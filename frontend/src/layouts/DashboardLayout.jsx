import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const NAV_LINKS_EMPLOYEE = [
  { to: '/attendance', label: 'Attendance', icon: '⏱' },
  { to: '/leave',      label: 'Leave',      icon: '🗓' },
]

const NAV_LINKS_ADMIN = [
  { to: '/attendance',       label: 'My Attendance', icon: '⏱' },
  { to: '/leave',            label: 'My Leave',      icon: '🗓' },
  { to: '/admin/attendance', label: 'All Attendance', icon: '📋' },
  { to: '/admin/leave',      label: 'All Leave',     icon: '📝' },
]

export default function DashboardLayout() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const links = isAdmin ? NAV_LINKS_ADMIN : NAV_LINKS_EMPLOYEE

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-bg-base)' }}>

      {/* ─── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className="w-64 flex flex-col flex-shrink-0 border-r"
        style={{ background: 'var(--color-bg-surface)', borderColor: 'var(--color-border)' }}
      >
        {/* Brand */}
        <div className="px-6 py-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <span className="text-xl font-bold" style={{ color: 'var(--color-primary-light)' }}>
            ⚡ Dayflow
          </span>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-dim)' }}>HRMS</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {isAdmin && (
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-dim)' }}>
              Employee
            </p>
          )}
          {NAV_LINKS_EMPLOYEE.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-base ${
                  isActive
                    ? 'text-white'
                    : 'hover:text-white'
                }`
              }
              style={({ isActive }) => isActive
                ? { background: 'var(--color-primary)', color: 'white' }
                : { color: 'var(--color-text-muted)' }
              }
            >
              <span>{icon}</span>
              {label}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <p className="px-3 mt-4 mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-dim)' }}>
                Admin / HR
              </p>
              {NAV_LINKS_ADMIN.slice(2).map(({ to, label, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-base ${
                      isActive ? 'text-white' : 'hover:text-white'
                    }`
                  }
                  style={({ isActive }) => isActive
                    ? { background: 'var(--color-primary)', color: 'white' }
                    : { color: 'var(--color-text-muted)' }
                  }
                >
                  <span>{icon}</span>
                  {label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* User + logout */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
              style={{ background: 'var(--color-primary)', color: 'white' }}
            >
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-base)' }}>
                {user?.name}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--color-text-dim)' }}>
                {user?.role}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 rounded-lg text-sm font-medium transition-base text-left"
            style={{ color: 'var(--color-text-muted)', background: 'transparent' }}
            onMouseEnter={e => { e.target.style.background = 'var(--color-bg-hover)'; e.target.style.color = 'var(--color-danger)' }}
            onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--color-text-muted)' }}
          >
            🚪 Sign out
          </button>
        </div>
      </aside>

      {/* ─── Main content ────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
