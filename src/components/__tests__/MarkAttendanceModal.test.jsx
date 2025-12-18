import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import axios from 'axios'
import { API_BASE_URL } from '../../config/api'
import MarkAttendanceModal from '../MarkAttendanceModal'

jest.mock('axios')

describe('MarkAttendanceModal Component', () => {
  const mockStaff = {
    _id: 'staff123',
    name: 'John Doe',
    staffId: 'EMP001'
  }
  const mockOnClose = jest.fn()
  const mockOnSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.setItem('token', 'mock-token')
  })

  it('does not render when show is false', () => {
    const { container } = render(
      <MarkAttendanceModal 
        show={false} 
        onClose={mockOnClose} 
        staff={mockStaff} 
        onSuccess={mockOnSuccess} 
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders modal when show is true', () => {
    render(
      <MarkAttendanceModal 
        show={true} 
        onClose={mockOnClose} 
        staff={mockStaff} 
        onSuccess={mockOnSuccess} 
      />
    )
    
    expect(screen.getByText('Mark Attendance')).toBeInTheDocument()
    expect(screen.getByDisplayValue(mockStaff.name)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /mark present/i })).toBeInTheDocument()
  })

  it('closes modal when clicking overlay', () => {
    render(
      <MarkAttendanceModal 
        show={true} 
        onClose={mockOnClose} 
        staff={mockStaff} 
        onSuccess={mockOnSuccess} 
      />
    )
    
    const overlay = screen.getByText('Mark Attendance').closest('.modal-overlay')
    fireEvent.click(overlay)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('closes modal when clicking close button', () => {
    render(
      <MarkAttendanceModal 
        show={true} 
        onClose={mockOnClose} 
        staff={mockStaff} 
        onSuccess={mockOnSuccess} 
      />
    )
    
    const closeButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('allows date selection with max date restriction', () => {
    render(
      <MarkAttendanceModal 
        show={true} 
        onClose={mockOnClose} 
        staff={mockStaff} 
        onSuccess={mockOnSuccess} 
      />
    )
    
    const dateInput = screen.getByDisplayValue(new Date().toISOString().split('T')[0])
    const today = new Date().toISOString().split('T')[0]
    
    expect(dateInput).toHaveAttribute('max', today)
    expect(dateInput).toHaveAttribute('type', 'date')
  })

  it('submits attendance successfully', async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true } })

    render(
      <MarkAttendanceModal 
        show={true} 
        onClose={mockOnClose} 
        staff={mockStaff} 
        onSuccess={mockOnSuccess} 
      />
    )
    
    const submitButton = screen.getByRole('button', { name: /mark present/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/attendance/mark`,
        {
          staffId: mockStaff._id,
          date: expect.any(String),
          status: 'Present'
        },
        {
          headers: {
            'Authorization': 'Bearer mock-token'
          }
        }
      )
      expect(mockOnSuccess).toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('handles API error gracefully', async () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})
    axios.post.mockRejectedValueOnce(new Error('Network error'))

    render(
      <MarkAttendanceModal 
        show={true} 
        onClose={mockOnClose} 
        staff={mockStaff} 
        onSuccess={mockOnSuccess} 
      />
    )
    
    const submitButton = screen.getByRole('button', { name: /mark present/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Failed to mark attendance')
    })

    alertSpy.mockRestore()
  })

  it('disables submit button during loading', async () => {
    axios.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))

    render(
      <MarkAttendanceModal 
        show={true} 
        onClose={mockOnClose} 
        staff={mockStaff} 
        onSuccess={mockOnSuccess} 
      />
    )
    
    const submitButton = screen.getByRole('button', { name: /mark present/i })
    fireEvent.click(submitButton)

    expect(screen.getByRole('button', { name: /marking/i })).toBeDisabled()
  })
})
