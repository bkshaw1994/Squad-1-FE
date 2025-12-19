import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { API_BASE_URL } from '../config/api'
import './Modal.css'

function EditStaffModal({ show, onClose, staff, onSuccess }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    shift: 'morning'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (staff) {
      setFormData({
        date: staff.date || new Date().toISOString().split('T')[0],
        shift: staff.shift?.toLowerCase() || 'morning'
      })
    }
  }, [staff])

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      await axios.put(
        `${API_BASE_URL}/api/staff/${staff._id}`,
        {
          date: formData.date,
          shift: formData.shift.charAt(0).toUpperCase() + formData.shift.slice(1)
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      toast.success('Staff schedule updated successfully')
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Error updating staff:', err)
      toast.error(
        err.response?.data?.message || 'Failed to update staff schedule'
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
          <h3>Edit Staff Schedule</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Staff Name</label>
            <input type="text" value={staff?.name || ''} disabled className="form-input" />
          </div>
          <div className='sameLabel'>
            <div className="form-group sameCl">
              <label>Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="form-input"
              />
            </div>
            <div className="form-group sameCl">
              <label>Shift</label>
              <select
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                className="form-input"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
              </select>
            </div>
          </div>
          
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn-save" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditStaffModal
