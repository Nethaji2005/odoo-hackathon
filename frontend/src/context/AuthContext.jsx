import { createContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/api'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(() => localStorage.getItem('dayflow_token'))
  const [loading, setLoading] = useState(true)

  // Restore session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('dayflow_user')
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        logout()
      }
    }
    setLoading(false)
  }, []) // eslint-disable-line

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password)
    const { token: t, user: u } = data
    localStorage.setItem('dayflow_token', t)
    localStorage.setItem('dayflow_user', JSON.stringify(u))
    setToken(t)
    setUser(u)
    return u
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('dayflow_token')
    localStorage.removeItem('dayflow_user')
    setToken(null)
    setUser(null)
  }, [])

  const isAdmin = user?.role === 'admin' || user?.role === 'hr'

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}
