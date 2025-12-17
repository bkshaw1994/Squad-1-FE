import { useState } from 'react'
import { X } from 'lucide-react'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'
import './Modal.css'

function MarkAttendanceModal({ show, onClose, staff, onSuccess }) {
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      await axios.post(
        `${API_BASE_URL}/api/attendance/mark`,
        {
          staffId: staff._id,
          date: attendanceDate,
          status: 'Present'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      alert('Attendance marked successfully')
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Error marking attendance:', err)
      alert('Failed to mark attendance')
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Mark Attendance</h3>
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
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="form-input"
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn-save" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Marking...' : 'Mark Present'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default MarkAttendanceModal
