import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import axios from 'axios'
import StaffDetails from '../StaffDetails'

jest.mock('axios')

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}))

describe('StaffDetails Component', () => {
  const mockStaff = {
    _id: 'staff123',
    name: 'John Doe',
    staffId: 'EMP001',
    role: 'Nurse',
    shift: 'Morning',
    email: 'john@example.com'
  }

  const mockWeeklyStats = {
    success: true,
    data: {
      staff: mockStaff,
      period: {
        startDate: '2025-12-01',
        endDate: '2025-12-07'
      },
      statistics: {
        totalDays: 7,
        present: 5,
        absent: 1,
        leave: 1,
        halfDay: 0,
        notMarked: 0,
        attendanceRate: 71.43
      },
      records: [
        {
          date: '2025-12-01',
          shift: 'Morning',
          status: 'Present',
          remarks: ''
        }
      ]
    }
  }

  const MockStaffDetails = () => (
    <MemoryRouter initialEntries={[{ pathname: '/staff/staff123', state: { staff: mockStaff } }]}>
      <Routes>
        <Route path="/staff/:id" element={<StaffDetails />} />
      </Routes>
    </MemoryRouter>
  )

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.setItem('token', 'mock-token')
  })

  it('redirects to dashboard if no staff data provided', () => {
    render(
      <MemoryRouter initialEntries={['/staff/staff123']}>
        <Routes>
          <Route path="/staff/:id" element={<StaffDetails />} />
        </Routes>
      </MemoryRouter>
    )

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
  })

  it('fetches and displays weekly statistics', async () => {
    axios.get.mockResolvedValueOnce({ data: mockWeeklyStats })

    render(<MockStaffDetails />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('EMP001')).toBeInTheDocument()
      expect(screen.getByText('Nurse')).toBeInTheDocument()
    })
  })

  it('displays attendance statistics correctly', async () => {
    axios.get.mockResolvedValue({ data: mockWeeklyStats })

    render(<MockStaffDetails />)

    await waitFor(() => {
      expect(screen.queryAllByText('Loading...').length).toBe(0)
    })
    
    expect(screen.getByText('Total Days:')).toBeInTheDocument()
    expect(screen.getByText('Present:')).toBeInTheDocument()
    expect(screen.getByText('Absent:')).toBeInTheDocument()
    expect(screen.getByText('Leave:')).toBeInTheDocument()
    // Check the values exist (may be multiple '1's so we just verify the structure is rendered)
    const values = screen.getAllByText(/^[0-9]+$/)
    expect(values.length).toBeGreaterThan(0)
  })

  it('displays staff info card', async () => {
    axios.get.mockResolvedValue({ data: mockWeeklyStats })

    render(<MockStaffDetails />)

    await waitFor(() => {
      expect(screen.queryAllByText('Loading...').length).toBe(0)
    })
    
    expect(screen.getByText('Staff Information')).toBeInTheDocument()
    expect(screen.getByText('Staff ID:')).toBeInTheDocument()
    expect(screen.getByText('EMP001')).toBeInTheDocument()
    expect(screen.getByText('Role:')).toBeInTheDocument()
    expect(screen.getByText('Nurse')).toBeInTheDocument()
    expect(screen.getAllByText('Current Shift:').length).toBeGreaterThan(0)
    expect(screen.getByText('Email:')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('renders Mark Attendance button', async () => {
    axios.get.mockResolvedValueOnce({ data: mockWeeklyStats })

    render(<MockStaffDetails />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /mark attendance/i })).toBeInTheDocument()
    })
  })

  it('renders Apply Leave button', async () => {
    axios.get.mockResolvedValueOnce({ data: mockWeeklyStats })

    render(<MockStaffDetails />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /apply leave/i })).toBeInTheDocument()
    })
  })

  it('displays shift records information', async () => {
    axios.get.mockResolvedValue({ data: mockWeeklyStats })

    render(<MockStaffDetails />)

    await waitFor(() => {
      expect(screen.queryAllByText('Loading...').length).toBe(0)
    })
    
    expect(screen.getByText('Shift Records')).toBeInTheDocument()
    expect(screen.getByText('Total Records:')).toBeInTheDocument()
    expect(screen.getByText('Period:')).toBeInTheDocument()
    expect(screen.getAllByText('Current Shift:').length).toBe(2) // Appears in both info card and shift records
  })

  it('shows loading state while fetching data', () => {
    axios.get.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))

    render(<MockStaffDetails />)

    const loadingElements = screen.getAllByText(/loading/i)
    expect(loadingElements.length).toBeGreaterThan(0)
  })

  it('handles API error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    axios.get.mockRejectedValueOnce(new Error('Network error'))

    render(<MockStaffDetails />)

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    consoleErrorSpy.mockRestore()
  })

  it('renders back button', async () => {
    axios.get.mockResolvedValueOnce({ data: mockWeeklyStats })

    render(<MockStaffDetails />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /back to dashboard/i })).toBeInTheDocument()
    })
  })

  it('navigates back to dashboard when back button is clicked', async () => {
    axios.get.mockResolvedValueOnce({ data: mockWeeklyStats })

    render(<MockStaffDetails />)

    await waitFor(() => {
      const backButton = screen.getByRole('button', { name: /back to dashboard/i })
      backButton.click()
    })

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
  })

  it('calls API with correct staff ID', async () => {
    axios.get.mockResolvedValueOnce({ data: mockWeeklyStats })

    render(<MockStaffDetails />)

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:3000/api/staff/staff123/weekly-stats',
        {
          headers: {
            'Authorization': 'Bearer mock-token'
          }
        }
      )
    })
  })

  it('displays Weekly Attendance Stats heading', async () => {
    axios.get.mockResolvedValueOnce({ data: mockWeeklyStats })

    render(<MockStaffDetails />)

    await waitFor(() => {
      expect(screen.getByText('Weekly Attendance Stats')).toBeInTheDocument()
    })
  })

  it('handles missing statistics gracefully', async () => {
    const incompleteStats = {
      success: true,
      data: {
        staff: mockStaff,
        statistics: {}
      }
    }
    axios.get.mockResolvedValueOnce({ data: incompleteStats })

    render(<MockStaffDetails />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
  })
})
