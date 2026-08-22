import { useState, useEffect, useCallback } from 'react'
import { leaveService } from '../../services/leaveService'
import { useToast } from '../../context/ToastContext'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

export default function AdminLeavePage() {
  const toast = useToast()
  const [leaves, setLeaves]   = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  // Review modal state
  const [reviewModal, setReviewModal]   = useState(false)
  const [selected, setSelected]         = useState(null)  // leave object
  const [action, setAction]             = useState('')     // 'approve' | 'reject'
  const [comment, setComment]           = useState('')
  const [submitting, setSubmitting]     = useState(false)

  const fetchLeaves = useCallback(async () => {
    setLoading(true)
    try {
      const params = statusFilter ? { status: statusFilter } : {}
      const data = await leaveService.getAllLeaves(params)
      setLeaves(data.leaves || [])
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [statusFilter]) // eslint-disable-line

  useEffect(() => { fetchLeaves() }, [fetchLeaves])

  const openReview = (leave, act) => {
    setSelected(leave)
    setAction(act)
    setComment('')
    setReviewModal(true)
  }

  const handleReview = async () => {
    setSubmitting(true)
    try {
      if (action === 'approve') {
        await leaveService.approveLeave(selected._id, comment)
        toast.success('Leave approved successfully.')
      } else {
        await leaveService.rejectLeave(selected._id, comment)
        toast.success('Leave rejected.')
      }
      setReviewModal(false)
      fetchLeaves()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const stats = {
    total:    leaves.length,
    pending:  leaves.filter(l => l.status === 'pending').length,
    approved: leaves.filter(l => l.status === 'approved').length,
    rejected: leaves.filter(l => l.status === 'rejected').length,
  }

  return (
    <div className="animate-fade-in space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-base)' }}>Leave Requests</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          Review and manage employee leave applications
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total',    value: stats.total,    color: 'var(--color-primary-light)' },
          { label: 'Pending',  value: stats.pending,  color: 'var(--color-text-muted)' },
          { label: 'Approved', value: stats.approved, color: 'var(--color-success)' },
          { label: 'Rejected', value: stats.rejected, color: 'var(--color-danger)' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="text-center">
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-dim)' }}>{label}</p>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <Card>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Filter:</span>
          <div className="flex rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
            {[['', 'All'], ['pending','Pending'], ['approved','Approved'], ['rejected','Rejected']].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setStatusFilter(val)}
                className="px-4 py-2 text-sm font-medium transition-base"
                style={{
                  background: statusFilter === val ? 'var(--color-primary)' : 'var(--color-bg-base)',
                  color: statusFilter === val ? 'white' : 'var(--color-text-muted)',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          </div>
        ) : leaves.length === 0 ? (
          <p className="text-center py-12 text-sm" style={{ color: 'var(--color-text-dim)' }}>
            No leave requests found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Employee', 'Type', 'From', 'To', 'Remarks', 'Status', 'Comment', 'Actions'].map(h => (
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
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: 'var(--color-primary)', color: 'white' }}
                        >
                          {l.employee?.name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: 'var(--color-text-base)' }}>{l.employee?.name}</p>
                          <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{l.employee?.department || l.employee?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3"><Badge status={l.leaveType} /></td>
                    <td className="py-3 px-3" style={{ color: 'var(--color-text-muted)' }}>{fmtDate(l.startDate)}</td>
                    <td className="py-3 px-3" style={{ color: 'var(--color-text-muted)' }}>{fmtDate(l.endDate)}</td>
                    <td className="py-3 px-3 max-w-[160px]">
                      <p className="truncate text-xs" style={{ color: 'var(--color-text-muted)' }} title={l.remarks}>
                        {l.remarks}
                      </p>
                    </td>
                    <td className="py-3 px-3"><Badge status={l.status} /></td>
                    <td className="py-3 px-3 max-w-[160px]">
                      {l.adminComment ? (
                        <p className="truncate text-xs" style={{ color: 'var(--color-text-muted)' }} title={l.adminComment}>
                          {l.adminComment}
                        </p>
                      ) : <span style={{ color: 'var(--color-text-dim)' }}>—</span>}
                    </td>
                    <td className="py-3 px-3">
                      {l.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => openReview(l, 'approve')}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-base"
                            style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid #166534' }}
                            onMouseEnter={e => e.target.style.background = 'rgba(34,197,94,0.25)'}
                            onMouseLeave={e => e.target.style.background = 'rgba(34,197,94,0.15)'}
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => openReview(l, 'reject')}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-base"
                            style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid #991b1b' }}
                            onMouseEnter={e => e.target.style.background = 'rgba(239,68,68,0.25)'}
                            onMouseLeave={e => e.target.style.background = 'rgba(239,68,68,0.15)'}
                          >
                            ✕ Reject
                          </button>
                        </div>
                      ) : (
                        <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                          {l.reviewedBy ? `by ${l.reviewedBy.name}` : '—'}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ─── Review Modal ─────────────────────────────────────────────────── */}
      <Modal
        isOpen={reviewModal}
        onClose={() => setReviewModal(false)}
        title={action === 'approve' ? '✓ Approve Leave Request' : '✕ Reject Leave Request'}
      >
        {selected && (
          <div className="space-y-4">
            {/* Summary */}
            <div
              className="rounded-xl p-4 border space-y-2 text-sm"
              style={{ background: 'var(--color-bg-base)', borderColor: 'var(--color-border)' }}
            >
              <div className="flex justify-between">
                <span style={{ color: 'var(--color-text-dim)' }}>Employee</span>
                <span className="font-medium" style={{ color: 'var(--color-text-base)' }}>{selected.employee?.name}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--color-text-dim)' }}>Leave type</span>
                <Badge status={selected.leaveType} />
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--color-text-dim)' }}>Period</span>
                <span style={{ color: 'var(--color-text-muted)' }}>
                  {fmtDate(selected.startDate)} → {fmtDate(selected.endDate)}
                </span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span style={{ color: 'var(--color-text-dim)' }}>Remarks</span>
                <span className="text-right max-w-[200px]" style={{ color: 'var(--color-text-muted)' }}>
                  {selected.remarks}
                </span>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                Comment <span style={{ color: 'var(--color-text-dim)' }}>(optional)</span>
              </label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder={action === 'approve' ? 'Approved. Enjoy your leave!' : 'Reason for rejection...'}
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none resize-none transition-base"
                style={{ background: 'var(--color-bg-base)', borderColor: 'var(--color-border)', color: 'var(--color-text-base)' }}
                onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
              />
            </div>

            <div className="flex gap-3 justify-end pt-1">
              <Button variant="ghost" onClick={() => setReviewModal(false)}>Cancel</Button>
              <Button
                onClick={handleReview}
                loading={submitting}
                variant={action === 'approve' ? 'success' : 'danger'}
              >
                {action === 'approve' ? '✓ Confirm Approve' : '✕ Confirm Reject'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
