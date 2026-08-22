import { useState, useEffect, useCallback } from 'react'
import { attendanceService } from '../../services/attendanceService'
import { useToast } from '../../context/ToastContext'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'

const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—'
const fmtDate = (s) => new Date(s + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })
const fmtDuration = (mins) => {
  if (!mins) return '—'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

const TODAY = new Date().toISOString().split('T')[0]

export default function AdminAttendancePage() {
  const toast = useToast()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [dateFilter, setDateFilter] = useState(TODAY)
  const [weekFilter, setWeekFilter] = useState('')
  const [filterMode, setFilterMode] = useState('date') // 'date' | 'week' | 'all'

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (filterMode === 'date' && dateFilter) params.date = dateFilter
      if (filterMode === 'week' && weekFilter) params.week = weekFilter
      const data = await attendanceService.getAllAttendance(params)
      setRecords(data.records || [])
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [filterMode, dateFilter, weekFilter]) // eslint-disable-line

  useEffect(() => { fetchRecords() }, [fetchRecords])

  // Summary stats
  const stats = {
    total:   records.length,
    present: records.filter(r => r.status === 'present').length,
    halfDay: records.filter(r => r.status === 'half-day').length,
    absent:  records.filter(r => r.status === 'absent').length,
  }

  return (
    <div className="animate-fade-in space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-base)' }}>Attendance Overview</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          Monitor employee attendance records
        </p>
      </div>

      {/* ─── Filters ─────────────────────────────────────────────────────── */}
      <Card>
        <div className="flex flex-wrap items-end gap-4">
          {/* Mode selector */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-dim)' }}>View</label>
            <div className="flex rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
              {[['date','By Day'], ['week','By Week'], ['all','All Records']].map(([mode, label]) => (
                <button
                  key={mode}
                  onClick={() => setFilterMode(mode)}
                  className="px-4 py-2 text-sm font-medium transition-base"
                  style={{
                    background: filterMode === mode ? 'var(--color-primary)' : 'var(--color-bg-base)',
                    color: filterMode === mode ? 'white' : 'var(--color-text-muted)',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {filterMode === 'date' && (
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-dim)' }}>Date</label>
              <input
                type="date"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border text-sm outline-none"
                style={{ background: 'var(--color-bg-base)', borderColor: 'var(--color-border)', color: 'var(--color-text-base)' }}
              />
            </div>
          )}

          {filterMode === 'week' && (
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-dim)' }}>
                Any date in the week
              </label>
              <input
                type="date"
                value={weekFilter}
                onChange={e => setWeekFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border text-sm outline-none"
                style={{ background: 'var(--color-bg-base)', borderColor: 'var(--color-border)', color: 'var(--color-text-base)' }}
              />
            </div>
          )}
        </div>
      </Card>

      {/* ─── Stats row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Records', value: stats.total,   color: 'var(--color-primary-light)' },
          { label: 'Present',       value: stats.present, color: 'var(--color-success)' },
          { label: 'Half-day',      value: stats.halfDay, color: 'var(--color-warning)' },
          { label: 'Absent',        value: stats.absent,  color: 'var(--color-danger)' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="text-center">
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-dim)' }}>{label}</p>
          </Card>
        ))}
      </div>

      {/* ─── Table ───────────────────────────────────────────────────────── */}
      <Card>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          </div>
        ) : records.length === 0 ? (
          <p className="text-center py-12 text-sm" style={{ color: 'var(--color-text-dim)' }}>
            No attendance records found for the selected filter.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Employee', 'Department', 'Date', 'Check In', 'Check Out', 'Duration', 'Status'].map(h => (
                    <th key={h} className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wide"
                      style={{ color: 'var(--color-text-dim)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr
                    key={r._id}
                    className="transition-base"
                    style={{ borderBottom: '1px solid var(--color-border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: 'var(--color-primary)', color: 'white' }}
                        >
                          {r.employee?.name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: 'var(--color-text-base)' }}>{r.employee?.name}</p>
                          <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{r.employee?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3" style={{ color: 'var(--color-text-muted)' }}>
                      {r.employee?.department || '—'}
                    </td>
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
    </div>
  )
}
