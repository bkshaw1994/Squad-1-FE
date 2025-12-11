import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, FileText, CheckCircle } from 'lucide-react'
import axios from 'axios'
import MarkAttendanceModal from '../components/MarkAttendanceModal'
import ApplyLeaveModal from '../components/ApplyLeaveModal'
import './StaffDetails.css'

function StaffDetails() {
  const navigate = useNavigate()
  const location = useLocation()
  const staff = location.state?.staff
  const [weeklyStats, setWeeklyStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showMarkAttendanceModal, setShowMarkAttendanceModal] = useState(false)
  const [showApplyLeaveModal, setShowApplyLeaveModal] = useState(false)

  const fetchWeeklyStats = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `http://localhost:3000/api/staff/${staff._id}/weekly-stats`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      console.log('Weekly stats response:', response.data)
      setWeeklyStats(response.data.data || response.data)
    } catch (err) {
      console.error('Error fetching weekly stats:', err)
    } finally {
      setLoading(false)
    }
  }, [staff])

  useEffect(() => {
    if (!staff) {
      navigate('/dashboard')
      return
    }

    fetchWeeklyStats()
  }, [staff, navigate, fetchWeeklyStats])

  const handleMarkAttendance = () => {
    setShowMarkAttendanceModal(true)
  }

  const handleApplyLeave = () => {
    setShowApplyLeaveModal(true)
  }

  const handleModalSuccess = () => {
    fetchWeeklyStats() // Refresh data after modal actions
  }

  if (!staff) {
    return null
  }

  return (
    <div className="staff-details-container">
      {/* Header */}
      <header className="staff-details-header">
        <div className="header-content">
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <h1 className="header-title">{staff.name}</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="staff-details-main">
        {/* Staff Info Card */}
        <div className="info-card">
          <h2>Staff Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Staff ID:</span>
              <span className="info-value">{staff.staffId || staff.id}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Role:</span>
              <span className="info-value">{staff.role || staff.position}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Current Shift:</span>
              <span className="info-value shift-badge">{staff.shift || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{staff.email || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-section">
          <div className="stat-card-details">
            <div className="stat-icon-details login">
              <Calendar size={24} />
            </div>
            <div className="stat-content">
              <h3>Weekly Attendance Stats</h3>
              {loading ? (
                <p>Loading...</p>
              ) : weeklyStats ? (
                <div className="weekly-stats">
                  <div className="stat-row">
                    <span>Total Days:</span>
                    <strong>{weeklyStats.statistics?.totalDays || 0}</strong>
                  </div>
                  <div className="stat-row">
                    <span>Present:</span>
                    <strong>{weeklyStats.statistics?.present || 0}</strong>
                  </div>
                  <div className="stat-row">
                    <span>Absent:</span>
                    <strong>{weeklyStats.statistics?.absent || 0}</strong>
                  </div>
                  <div className="stat-row">
                    <span>Leave:</span>
                    <strong>{weeklyStats.statistics?.leave || 0}</strong>
                  </div>
                  <div className="stat-row">
                    <span>Attendance Rate:</span>
                    <strong>{weeklyStats.statistics?.attendanceRate || '0%'}</strong>
                  </div>
                </div>
              ) : (
                <p>No data available</p>
              )}
            </div>
          </div>

          <div className="stat-card-details">
            <div className="stat-icon-details shift">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <h3>Shift Records</h3>
              {loading ? (
                <p>Loading...</p>
              ) : weeklyStats ? (
                <div className="weekly-stats">
                  <div className="stat-row">
                    <span>Total Records:</span>
                    <strong>{weeklyStats.records?.length || 0}</strong>
                  </div>
                  <div className="stat-row">
                    <span>Period:</span>
                    <strong>
                      {weeklyStats.period?.startDate && new Date(weeklyStats.period.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weeklyStats.period?.endDate && new Date(weeklyStats.period.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </strong>
                  </div>
                  <div className="stat-row">
                    <span>Current Shift:</span>
                    <strong>{weeklyStats.staff?.shift || 'N/A'}</strong>
                  </div>
                </div>
              ) : (
                <p>No data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons-section">
          <button className="btn-primary" onClick={handleMarkAttendance}>
            <CheckCircle size={20} />
            Mark Attendance
          </button>
          <button className="btn-secondary" onClick={handleApplyLeave}>
            <FileText size={20} />
            Apply Leave
          </button>
        </div>
      </main>

      <MarkAttendanceModal
        show={showMarkAttendanceModal}
        onClose={() => setShowMarkAttendanceModal(false)}
        staff={staff}
        onSuccess={handleModalSuccess}
      />

      <ApplyLeaveModal
        show={showApplyLeaveModal}
        onClose={() => setShowApplyLeaveModal(false)}
        staff={staff}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}

export default StaffDetails
