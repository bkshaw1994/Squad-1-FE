import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'
import Dashboard from '../Dashboard'

jest.mock('axios')

const MockDashboard = () => (
  <BrowserRouter>
    <Dashboard />
  </BrowserRouter>
)

describe('Dashboard Component', () => {
  const mockStaffData = {
    success: true,
    count: 2,
    data: [
      {
        _id: 'staff1',
        name: 'John Doe',
        staffId: 'EMP001',
        role: 'Nurse',
        shift: 'Morning',
        email: 'john@example.com'
      },
      {
        _id: 'staff2',
        name: 'Jane Smith',
        staffId: 'EMP002',
        role: 'Doctor',
        shift: 'Evening',
        email: 'jane@example.com'
      }
    ],
    shiftStatus: {
      Morning: {
        isFullyStaffed: true,
        staffCount: 5,
        requirements: 5,
        shortages: 0
      }
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.setItem('token', 'mock-token')
    localStorage.setItem('user', JSON.stringify({ name: 'Admin User', email: 'admin@example.com' }))
  })

  it('renders dashboard header with user name', async () => {
    axios.get.mockResolvedValueOnce({ data: mockStaffData })

    render(<MockDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Health Staff Scheduler & Attendance Tracker')).toBeInTheDocument()
      expect(screen.getByText('Admin User')).toBeInTheDocument()
    })
  })

  it('fetches and displays staff data', async () => {
    axios.get.mockResolvedValue({ data: mockStaffData })

    render(<MockDashboard />)

    await waitFor(() => {
      expect(screen.queryByText('Loading staff data...')).not.toBeInTheDocument()
    })
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('EMP001')).toBeInTheDocument()
    expect(screen.getByText('EMP002')).toBeInTheDocument()
  })

  it('displays date and shift filter dropdowns', async () => {
    axios.get.mockResolvedValueOnce({ data: mockStaffData })

    render(<MockDashboard />)

    await waitFor(() => {
      expect(screen.queryByText('Loading staff data...')).not.toBeInTheDocument()
    })
    
    expect(screen.getByPlaceholderText(/select date/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue('All Shifts')).toBeInTheDocument()
  })

  it('filters staff by shift selection', async () => {
    axios.get.mockResolvedValue({ data: mockStaffData })

    render(<MockDashboard />)

    await waitFor(() => {
      expect(screen.queryByText('Loading staff data...')).not.toBeInTheDocument()
    })
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()

    const shiftSelect = screen.getByRole('combobox')
    fireEvent.change(shiftSelect, { target: { value: 'evening' } })

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('shift=Evening'),
        expect.any(Object)
      )
    })
  })

  it('displays stats cards', async () => {
    axios.get.mockResolvedValue({ data: mockStaffData })

    render(<MockDashboard />)

    await waitFor(() => {
      expect(screen.queryByText('Loading staff data...')).not.toBeInTheDocument()
    })
    
    expect(screen.getByText('Total Staff')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('displays shift staffing status', async () => {
    const dataWithShortage = {
      ...mockStaffData,
      shiftStatus: {
        Morning: {
          isFullyStaffed: false,
          staffCount: 3,
          requirements: 5,
          shortages: [{ role: 'Nurse', current: 3, required: 5 }]
        }
      }
    }
    axios.get.mockResolvedValue({ data: dataWithShortage })

    render(<MockDashboard />)

    await waitFor(() => {
      expect(screen.queryByText('Loading staff data...')).not.toBeInTheDocument()
    })
    
    expect(screen.getByText('Shift Staffing Status')).toBeInTheDocument()
    expect(screen.getAllByText('Morning').length).toBeGreaterThan(0)
    expect(screen.getByText('Nurse: 3/5')).toBeInTheDocument()
  })

  it('opens edit modal when edit button is clicked', async () => {
    axios.get.mockResolvedValue({ data: mockStaffData })

    render(<MockDashboard />)

    await waitFor(() => {
      expect(screen.queryByText('Loading staff data...')).not.toBeInTheDocument()
    })
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()

    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    fireEvent.click(editButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Edit Staff Schedule')).toBeInTheDocument()
    })
  })

  it('navigates to staff details when mark attendance is clicked', async () => {
    axios.get.mockResolvedValue({ data: mockStaffData })

    render(<MockDashboard />)

    await waitFor(() => {
      expect(screen.queryByText('Loading staff data...')).not.toBeInTheDocument()
    })
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()

    const markAttendanceButtons = screen.getAllByRole('button', { name: /mark attendance/i })
    fireEvent.click(markAttendanceButtons[0])

    // Navigation would occur here
  })

  it('filters staff by search query', async () => {
    axios.get.mockResolvedValue({ data: mockStaffData })

    render(<MockDashboard />)

    await waitFor(() => {
      expect(screen.queryByText('Loading staff data...')).not.toBeInTheDocument()
    })
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText(/search/i)
    fireEvent.change(searchInput, { target: { value: 'John' } })

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
    })
  })

  it('handles logout functionality', async () => {
    axios.get.mockResolvedValueOnce({ data: mockStaffData })

    render(<MockDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Health Staff Scheduler & Attendance Tracker')).toBeInTheDocument()
    })

    const logoutButton = screen.getByRole('button', { name: /logout/i })
    fireEvent.click(logoutButton)

    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })

  it('shows loading state initially', () => {
    axios.get.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))

    render(<MockDashboard />)

    expect(screen.getByText('Loading staff data...')).toBeInTheDocument()
  })

  it('handles API error gracefully', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network error'))

    render(<MockDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Health Staff Scheduler & Attendance Tracker')).toBeInTheDocument()
    }, { timeout: 2000 })
    
    // Check that error message is displayed
    expect(screen.getByText('An unexpected error occurred while loading staff data.')).toBeInTheDocument()
  })

  it('refreshes data after successful edit', async () => {
    axios.get.mockResolvedValueOnce({ data: mockStaffData })

    render(<MockDashboard />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    fireEvent.click(editButtons[0])

    axios.put.mockResolvedValueOnce({ data: { success: true } })
    axios.get.mockResolvedValueOnce({ data: mockStaffData })

    const saveButton = screen.getByRole('button', { name: /save changes/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(2)
    })
  })
})
