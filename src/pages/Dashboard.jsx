import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Users, Search, Loader2, Edit, Trash2, CheckCircle, AlertTriangle, UserPlus } from 'lucide-react'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'
import EditStaffModal from '../components/EditStaffModal'
import AddStaffModal from '../components/AddStaffModal'
import './Dashboard.css'

function Dashboard() {
  const [user, setUser] = useState(null)
  const [staffs, setStaffs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedShift, setSelectedShift] = useState('')
  const [error, setError] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)
  const [allShiftsStatus, setAllShiftsStatus] = useState({})
  const navigate = useNavigate()

  const fetchStaffs = useCallback(async (token) => {
    try {
      setLoading(true)
      let url = `${API_BASE_URL}/api/staff?date=${selectedDate}`
      if (selectedShift) {
        // Capitalize first letter for camel casing
        const formattedShift = selectedShift.charAt(0).toUpperCase() + selectedShift.slice(1)
        url += `&shift=${formattedShift}`
      }
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      })
      console.log('Staff API response:', response.data)
      
      // Extract staffing status from shiftStatus
      if (response.data.shiftStatus) {
        const shiftData = response.data.shiftStatus
        setAllShiftsStatus(shiftData)
        console.log('All shifts status:', shiftData)
        
        // Get the shift key (Morning, Afternoon, Evening, Night)
        const shiftKey = Object.keys(shiftData)[0]
        
        if (shiftKey && shiftData[shiftKey]) {
          const currentShiftData = shiftData[shiftKey]
          
          if (currentShiftData.isFullyStaffed !== undefined) {
            console.log('isFullyStaffed:', currentShiftData.isFullyStaffed)
          }
          
          // Extract shortages
          if (currentShiftData.shortages && Array.isArray(currentShiftData.shortages)) {
            console.log('shortStaffs:', currentShiftData.shortages)
          } else {
            console.log('No shortages found')
          }
        }
      } else {
        setAllShiftsStatus({})
        console.log('No shiftStatus in response')
      }
      
      // Handle different response structures
      const staffData = response.data.data || response.data.staffs || response.data || []
      
      // Ensure it's an array
      if (Array.isArray(staffData)) {
        setStaffs(staffData)
      } else if (typeof staffData === 'object') {
        // If it's an object, try to convert to array
        setStaffs(Object.values(staffData))
      } else {
        console.warn('Unexpected staff data format:', staffData)
        setStaffs([])
      }
    } catch (err) {
      console.error('Error fetching staff:', err)
      console.error('Error response:', err.response?.data)
      console.error('Error status:', err.response?.status)
      
      if (err.code === 'NETWORK_ERROR' || (err.message && err.message.includes('Network Error'))) {
        setError('Network error: Cannot connect to server. Please check your internet connection.')
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timeout: Server took too long to respond.')
      } else if (err.response) {
        if (err.response.status === 0) {
          setError('CORS error: Server blocked the request. Please contact support.')
        } else if (err.response.status === 401) {
          setError('Authentication error: Please log in again.')
        } else {
          setError(`Server error: ${err.response.data?.message || err.response.status}`)
        }
      } else if (err.request) {
        setError('Cannot connect to server. The server may be down or there may be a network issue.')
      } else {
        setError('An unexpected error occurred while loading staff data.')
      }
      setStaffs([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }, [selectedDate, selectedShift])

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token) {
      navigate('/login')
      return
    }

    if (userData) {
      setUser(JSON.parse(userData))
    }

    // Fetch staff data
    fetchStaffs(token)
  }, [navigate, fetchStaffs])

  // Fetch data when date or shift changes
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token && selectedDate) {
      fetchStaffs(token)
    }
  }, [selectedDate, selectedShift, fetchStaffs])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('rememberedUsername')
    navigate('/login')
  }

  const handleEdit = (staff) => {
    setEditingStaff(staff)
    setShowEditModal(true)
  }

  const handleModalSuccess = () => {
    const token = localStorage.getItem('token')
    fetchStaffs(token)
  }

  const filteredStaffs = Array.isArray(staffs) ? staffs.filter(staff => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch = (
        staff.name?.toLowerCase().includes(query) ||
        staff.email?.toLowerCase().includes(query) ||
        staff.position?.toLowerCase().includes(query) ||
        staff.role?.toLowerCase().includes(query) ||
        staff.department?.toLowerCase().includes(query)
      )
      if (!matchesSearch) return false
    }

    return true
  }) : []

  if (!user) {
    return (
      <div className="spinner">
        <div className="spinner-circle"></div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon">
              <Users />
            </div>
            <h1 className="header-title">Health Staff Scheduler & Attendance Tracker</h1>
          </div>
          <div className="header-right">
            <span className="welcome-text">
              Welcome, <span>{user.name || user.userName || 'User'}</span>
            </span>
            <button onClick={handleLogout} className="logout-btn">
              <LogOut />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-content">
              <div className="stat-info">
                <p>Total Staff</p>
                <p className="stat-value total">{staffs.length}</p>
              </div>
              <div className="stat-icon total">
                <Users />
              </div>
            </div>
          </div>
          {/* Shift-wise Shortage Card */}
          {Object.keys(allShiftsStatus).length > 0 && (
            <div className="stat-card shortage-overview-card">
              <div className="stat-card-content">
                <div className="stat-info">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <p style={{ fontWeight: '600', fontSize: '1rem', margin: 0 }}>Shift Staffing Status</p>
                    <span style={{ fontSize: '0.875rem', color: '#92400e', fontWeight: '500' }}>
                      {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="shift-compact-grid">
                    {['Morning', 'Afternoon', 'Evening', 'Night'].map((shift) => {
                      const shiftData = allShiftsStatus[shift]
                      if (!shiftData) return null
                      
                      const hasShortage = shiftData.shortages && shiftData.shortages.length > 0
                      
                      return (
                        <div key={shift} className="shift-compact-item">
                          <div className="shift-name">{shift}</div>
                          <div className="shift-details">
                            {hasShortage ? (
                              shiftData.shortages.map((shortage, idx) => (
                                <div key={idx} className="compact-shortage">
                                  <AlertTriangle size={14} />
                                  <span>{shortage.role}: {shortage.current}/{shortage.required}</span>
                                </div>
                              ))
                            ) : (
                              <div className="compact-staffed">
                                <span>✓ Fully Staffed</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="stat-icon warning">
                  <AlertTriangle />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Staff Table */}
        <div className="table-container">
          <div className="table-header">
            <div className="table-header-content">
              <h2 className="table-title">Staff Directory</h2>
              <div className="filter-controls">
                <div className="search-box">
                  <Search className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search staff..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="filter-dropdown"
                  placeholder="Select Date"
                />
                <select
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                  className="filter-dropdown"
                >
                  <option value="">All Shifts</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night</option>
                </select>
                <button onClick={() => setShowAddModal(true)} className="add-staff-btn">
                  <UserPlus size={20} />
                  Add Staff
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <Loader2 />
              <span>Loading staff data...</span>
            </div>
          ) : error ? (
            <div className="error-container">
              <p>{error}</p>
            </div>
          ) : filteredStaffs.length === 0 ? (
            <div className="empty-container">
              <p>No staff members found</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="staff-table">
                <thead>
                  <tr>
                    <th>Staff ID</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Shift</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaffs.map((staff, index) => {
                    return (
                      <tr key={staff.id || index}>
                        <td className="staff-id">{staff.staffId || staff.id || index + 1}</td>
                        <td>
                          <div className="staff-name-cell">
                            <span className="staff-name">{staff.name || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="staff-role">{staff.role || staff.position || 'N/A'}</td>
                        <td className="staff-shift">
                          <span className="shift-badge">
                            {staff.shift || 'N/A'}
                          </span>
                        </td>
                        <td className="staff-actions">
                          <div className="action-buttons">
                            <button className="action-btn edit-btn" title="Edit" onClick={() => handleEdit(staff)}>
                              <Edit size={16} />
                            </button>
                            <button className="action-btn delete-btn" title="Delete">
                              <Trash2 size={16} />
                            </button>
                            <button 
                              className="action-btn attendance-btn" 
                              title="Mark Attendance"
                              onClick={() => navigate(`/staff/${staff.staffId || staff.id}`, { state: { staff } })}
                            >
                              <CheckCircle size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <EditStaffModal
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingStaff(null)
        }}
        staff={editingStaff}
        onSuccess={handleModalSuccess}
      />
      <AddStaffModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}

export default Dashboard
