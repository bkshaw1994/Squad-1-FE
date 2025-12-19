import { useState } from 'react'
import {  toast } from 'react-toastify'
import { X } from 'lucide-react'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'
import './Modal.css'

function ApplyLeaveModal({ show, onClose, staff, onSuccess }) {
  const [leaveDate, setLeaveDate] = useState(new Date().toISOString().split('T')[0])
  const [leaveReason, setLeaveReason] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!leaveReason.trim()) {
      toast.error('Please enter a reason for leave')
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      await axios.post(
        `${API_BASE_URL}/api/attendance/leave`,
        {
          staffId: staff._id,
          date: leaveDate,
          reason: leaveReason
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      toast.success('Leave applied successfully')
      setLeaveReason('')
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Error applying leave:', err)
      toast.error(
        err.response?.data?.message || 'Failed to apply leave'
      )
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Apply Leave</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Staff Name</label>
            <input type="text" value={staff.name} disabled className="form-input" />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={leaveDate}
              onChange={(e) => setLeaveDate(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Reason for Leave</label>
            <textarea
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              className="form-input form-textarea"
              placeholder="Enter reason for leave..."
              rows="4"
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn-save" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Leave'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ApplyLeaveModal
