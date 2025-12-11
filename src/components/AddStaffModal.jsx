import { useState } from 'react'
import { X, Calendar, Clock, User } from 'lucide-react'
import axios from 'axios'
import './Modal.css'

function AddStaffModal({ show, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    shift: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      
      const payload = {
        name: formData.name,
        role: formData.role,
        shift: formData.shift.charAt(0).toUpperCase() + formData.shift.slice(1),
        date: formData.date
      }
      
      // Add email only if provided
      if (formData.email) {
        payload.email = formData.email
      }
      
      console.log('Sending payload:', payload)
      
      const response = await axios.post(
        'http://localhost:3000/api/staff',
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      console.log('Response:', response.data)
      alert('Staff added successfully!')
      setFormData({
        name: '',
        email: '',
        role: '',
        shift: '',
        date: new Date().toISOString().split('T')[0]
      })
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Error adding staff:', err)
      console.error('Error response:', err.response?.data)
      alert(`Failed to add staff: ${err.response?.data?.error || err.response?.data?.message || err.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Staff</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">
                <User size={16} />
                Staff Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter staff name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <User size={16} />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <User size={16} />
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              >
                <option value="">Select Role</option>
                <option value="Doctor">Doctor</option>
                <option value="Nurse">Nurse</option>
                <option value="Technician">Technician</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Calendar size={16} />
                Start Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Clock size={16} />
                Shift
              </label>
              <select
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                required
              >
                <option value="">Select Shift</option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Staff'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddStaffModal
