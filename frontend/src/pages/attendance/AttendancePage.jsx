import { useState, useEffect, useCallback } from 'react'
import { attendanceService } from '../../services/attendanceService'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../context/ToastContext'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—'
const fmtDate = (s) => new Date(s + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })
const fmtDuration = (mins) => {
  if (!mins) return '—'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function AttendancePage() {
  const { user } = useAuth()
  const toast = useToast()

  const [today, setToday]       = useState(null)
  const [weekData, setWeekData] = useState([])
  const [history, setHistory]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // Live clock
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [t, w, h] = await Promise.all([
        attendanceService.getToday(),
        attendanceService.getWeek(),
        attendanceService.getMyAttendance(),
      ])
      setToday(t.record)
      setWeekData(w.records || [])
      setHistory(h.records || [])
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, []) // eslint-disable-line

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleCheckIn = async () => {
    setActionLoading(true)
    try {
      await attendanceService.checkIn()
      toast.success('Checked in successfully!')
      fetchAll()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleCheckOut = async () => {
    setActionLoading(true)
    try {
      await attendanceService.checkOut()
      toast.success('Checked out successfully!')
      fetchAll()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const canCheckIn  = !today?.checkIn
  const canCheckOut = today?.checkIn && !today?.checkOut

  // Live duration while working
  const liveDuration = today?.checkIn && !today?.checkOut
    ? Math.floor((now - new Date(today.checkIn)) / 60000)
    : today?.duration ?? 0

  return (
    <div className="animate-fade-in space-y-6 max-w-5xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-base)' }}>
          My Attendance
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          {now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      ) : (
        <>
          {/* ─── Today's Status Card ─────────────────────────────────────── */}
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              {/* Left: status & clock */}
              <div className="flex items-center gap-5">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 ${canCheckIn ? '' : 'animate-pulse-ring'}`}
                  style={{ background: today?.checkIn ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)' }}
                >
                  {today?.checkOut ? '✅' : today?.checkIn ? '⏱' : '⭕'}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold" style={{ color: 'var(--color-text-base)' }}>
                      {today?.checkOut ? 'Shift Complete' : today?.checkIn ? 'Currently Working' : 'Not Checked In'}
                    </span>
                    {today?.status && <Badge status={today.status} />}
                  </div>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Hello, {user?.name} 👋
                  </p>
                </div>
              </div>

              {/* Right: check-in/out buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleCheckIn}
                  disabled={!canCheckIn || actionLoading}
                  loading={actionLoading && canCheckIn}
                  variant="primary"
                >
                  🟢 Check In
                </Button>
                <Button
                  onClick={handleCheckOut}
                  disabled={!canCheckOut || actionLoading}
                  loading={actionLoading && canCheckOut}
                  variant={canCheckOut ? 'danger' : 'ghost'}
                >
                  🔴 Check Out
                </Button>
              </div>
            </div>

            {/* Time details row */}
            <div
              className="mt-5 pt-5 grid grid-cols-3 gap-4 border-t"
              style={{ borderColor: 'var(--color-border)' }}
            >
              {[
                { label: 'Check In', value: fmtTime(today?.checkIn) },
                { label: 'Check Out', value: fmtTime(today?.checkOut) },
                { label: 'Duration', value: fmtDuration(liveDuration) },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-dim)' }}>{label}</p>
                  <p className="text-lg font-semibold" style={{ color: 'var(--color-text-base)' }}>{value}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* ─── Weekly View ─────────────────────────────────────────────── */}
          <Card>
            <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--color-text-base)' }}>
              This Week
            </h2>
            <div className="grid grid-cols-7 gap-2">
              {WEEK_DAYS.map((day, i) => {
                const record = weekData[i]
                const isToday = record?.date === new Date().toISOString().split('T')[0]
                return (
                  <div
                    key={day}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-base ${isToday ? 'ring-2 ring-indigo-500' : ''}`}
                    style={{
                      background: record ? 'rgba(99,102,241,0.08)' : 'transparent',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <span className="text-xs font-semibold" style={{ color: 'var(--color-text-dim)' }}>{day}</span>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                        ${record?.status === 'present'  ? 'bg-green-900 text-green-400' : ''}
                        ${record?.status === 'half-day' ? 'bg-amber-900 text-amber-400' : ''}
                        ${record?.status === 'leave'    ? 'bg-indigo-900 text-indigo-400' : ''}
                        ${!record ? 'bg-transparent text-gray-600' : ''}
                      `}
                    >
                      {record?.status === 'present'  ? '✓' : ''}
                      {record?.status === 'half-day' ? '½' : ''}
                      {record?.status === 'leave'    ? 'L' : ''}
                      {!record                       ? '–' : ''}
                    </div>
                    <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                      {record ? fmtDuration(record.duration || 0) : '—'}
                    </span>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* ─── History Table ───────────────────────────────────────────── */}
          <Card>
            <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--color-text-base)' }}>
              Recent History
            </h2>
            {history.length === 0 ? (
              <p className="text-center py-8 text-sm" style={{ color: 'var(--color-text-dim)' }}>
                No attendance records yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                      {['Date', 'Check In', 'Check Out', 'Duration', 'Status'].map(h => (
                        <th key={h} className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wide"
                          style={{ color: 'var(--color-text-dim)' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((r) => (
                      <tr
                        key={r._id}
                        className="transition-base"
                        style={{ borderBottom: '1px solid var(--color-border)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td className="py-3 px-3 font-medium" style={{ color: 'var(--color-text-base)' }}>
                          {fmtDate(r.date)}
                        </td>
                        <td className="py-3 px-3" style={{ color: 'var(--color-text-muted)' }}>{fmtTime(r.checkIn)}</td>
                        <td className="py-3 px-3" style={{ color: 'var(--color-text-muted)' }}>{fmtTime(r.checkOut)}</td>
                        <td className="py-3 px-3" style={{ color: 'var(--color-text-muted)' }}>{fmtDuration(r.duration)}</td>
                        <td className="py-3 px-3"><Badge status={r.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
