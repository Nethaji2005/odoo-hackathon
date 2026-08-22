import { useState, useEffect, useCallback } from 'react'
import { leaveService } from '../../services/leaveService'
import { useToast } from '../../context/ToastContext'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

const LEAVE_TYPES = ['paid', 'sick', 'unpaid']

const inputStyle = {
  background: 'var(--color-bg-base)',
  borderColor: 'var(--color-border)',
  color: 'var(--color-text-base)',
}

export default function LeavePage() {
  const toast = useToast()
  const [leaves, setLeaves]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form state
  const [form, setForm] = useState({
    leaveType: 'paid',
    startDate: '',
    endDate: '',
    remarks: '',
  })
  const [formErrors, setFormErrors] = useState({})

  const fetchLeaves = useCallback(async () => {
    setLoading(true)
    try {
      const data = await leaveService.getMyLeaves()
      setLeaves(data.leaves || [])
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, []) // eslint-disable-line

  useEffect(() => { fetchLeaves() }, [fetchLeaves])

  const validate = () => {
    const errs = {}
    if (!form.startDate) errs.startDate = 'Start date is required'
    if (!form.endDate)   errs.endDate   = 'End date is required'
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      errs.endDate = 'End date cannot be before start date'
    }
    if (!form.remarks.trim()) errs.remarks = 'Remarks are required'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return }
    setSubmitting(true)
    try {
      await leaveService.applyLeave(form)
      toast.success('Leave application submitted!')
      setShowForm(false)
      setForm({ leaveType: 'paid', startDate: '', endDate: '', remarks: '' })
      setFormErrors({})
      fetchLeaves()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const statusCount = (s) => leaves.filter(l => l.status === s).length

  return (
    <div className="animate-fade-in space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-base)' }}>My Leave</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Apply for leave and track your requests
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>＋ Apply Leave</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending',  value: statusCount('pending'),  color: 'var(--color-text-muted)' },
          { label: 'Approved', value: statusCount('approved'), color: 'var(--color-success)' },
          { label: 'Rejected', value: statusCount('rejected'), color: 'var(--color-danger)' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="text-center">
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-dim)' }}>{label}</p>
          </Card>
        ))}
      </div>

      {/* Leave requests */}
      <Card>
        <h2 className="text-base font-semibold mb-4" style={{ color: 'var(--color-text-base)' }}>
          My Requests
        </h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          </div>
        ) : leaves.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🗓</p>
            <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>No leave requests yet.</p>
            <button
              className="mt-3 text-sm underline"
              style={{ color: 'var(--color-primary-light)' }}
              onClick={() => setShowForm(true)}
            >
              Apply for leave
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Type', 'From', 'To', 'Remarks', 'Status', 'Admin Comment', 'Submitted'].map(h => (
                    <th key={h} className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wide"
                      style={{ color: 'var(--color-text-dim)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leaves.map((l) => (
                  <tr
                    key={l._id}
                    className="transition-base"
                    style={{ borderBottom: '1px solid var(--color-border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td className="py-3 px-3"><Badge status={l.leaveType} /></td>
                    <td className="py-3 px-3" style={{ color: 'var(--color-text-muted)' }}>{fmtDate(l.startDate)}</td>
                    <td className="py-3 px-3" style={{ color: 'var(--color-text-muted)' }}>{fmtDate(l.endDate)}</td>
                    <td className="py-3 px-3 max-w-[200px]">
                      <p className="truncate" style={{ color: 'var(--color-text-muted)' }} title={l.remarks}>
                        {l.remarks}
                      </p>
                    </td>
                    <td className="py-3 px-3"><Badge status={l.status} /></td>
                    <td className="py-3 px-3 max-w-[180px]">
                      {l.adminComment ? (
                        <p className="truncate text-xs" style={{ color: 'var(--color-text-muted)' }} title={l.adminComment}>
                          {l.adminComment}
                        </p>
                      ) : (
                        <span style={{ color: 'var(--color-text-dim)' }}>—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-xs" style={{ color: 'var(--color-text-dim)' }}>
                      {fmtDate(l.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ─── Apply Leave Modal ───────────────────────────────────────────── */}
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setFormErrors({}) }} title="Apply for Leave">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Leave type */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>
              Leave Type
            </label>
            <div className="flex gap-2">
              {LEAVE_TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, leaveType: t }))}
                  className="flex-1 py-2 rounded-xl border text-sm font-medium capitalize transition-base"
                  style={{
                    background: form.leaveType === t ? 'var(--color-primary)' : 'var(--color-bg-base)',
                    borderColor: form.leaveType === t ? 'var(--color-primary)' : 'var(--color-border)',
                    color: form.leaveType === t ? 'white' : 'var(--color-text-muted)',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                Start Date
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-base"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
              />
              {formErrors.startDate && <p className="text-xs mt-1 text-red-400">{formErrors.startDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                End Date
              </label>
              <input
                type="date"
                value={form.endDate}
                min={form.startDate}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-base"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
              />
              {formErrors.endDate && <p className="text-xs mt-1 text-red-400">{formErrors.endDate}</p>}
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
              Remarks
            </label>
            <textarea
              value={form.remarks}
              onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
              placeholder="Reason for leave..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none resize-none transition-base"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
            />
            {formErrors.remarks && <p className="text-xs mt-1 text-red-400">{formErrors.remarks}</p>}
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => { setShowForm(false); setFormErrors({}) }}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>Submit Application</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
