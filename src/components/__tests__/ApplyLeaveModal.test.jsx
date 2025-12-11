import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import axios from 'axios'
import ApplyLeaveModal from '../ApplyLeaveModal'

jest.mock('axios')

describe('ApplyLeaveModal Component', () => {
  const mockStaff = {
    _id: 'staff123',
    name: 'Jane Smith',
    staffId: 'EMP002'
  }
  const mockOnClose = jest.fn()
  const mockOnSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.setItem('token', 'mock-token')
  })

  it('does not render when show is false', () => {
    const { container } = render(
      <ApplyLeaveModal 
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
      <ApplyLeaveModal 
        show={true} 
        onClose={mockOnClose} 
        staff={mockStaff} 
        onSuccess={mockOnSuccess} 
      />
    )
    
    expect(screen.getByText('Apply Leave')).toBeInTheDocument()
    expect(screen.getByDisplayValue(mockStaff.name)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit leave/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter reason for leave/i)).toBeInTheDocument()
  })

  it('closes modal when clicking cancel', () => {
    render(
      <ApplyLeaveModal 
        show={true} 
        onClose={mockOnClose} 
        staff={mockStaff} 
        onSuccess={mockOnSuccess} 
      />
    )
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('validates that reason is required', async () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})

    render(
      <ApplyLeaveModal 
        show={true} 
        onClose={mockOnClose} 
        staff={mockStaff} 
        onSuccess={mockOnSuccess} 
      />
    )
    
    const submitButton = screen.getByRole('button', { name: /submit leave/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Please enter a reason for leave')
      expect(axios.post).not.toHaveBeenCalled()
    })

    alertSpy.mockRestore()
  })

  it('submits leave application successfully', async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true } })

    render(
      <ApplyLeaveModal 
        show={true} 
        onClose={mockOnClose} 
        staff={mockStaff} 
        onSuccess={mockOnSuccess} 
      />
    )
    
    const reasonInput = screen.getByPlaceholderText(/enter reason for leave/i)
    const submitButton = screen.getByRole('button', { name: /submit leave/i })

    fireEvent.change(reasonInput, { target: { value: 'Medical emergency' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/attendance/leave',
        {
          staffId: mockStaff._id,
          date: expect.any(String),
          reason: 'Medical emergency'
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

  it('clears reason field after successful submission', async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true } })

    render(
      <ApplyLeaveModal 
        show={true} 
        onClose={mockOnClose} 
        staff={mockStaff} 
        onSuccess={mockOnSuccess} 
      />
    )
    
    const reasonInput = screen.getByPlaceholderText(/enter reason for leave/i)
    fireEvent.change(reasonInput, { target: { value: 'Sick leave' } })

    const submitButton = screen.getByRole('button', { name: /submit leave/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('handles API error gracefully', async () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})
    axios.post.mockRejectedValueOnce(new Error('Server error'))

    render(
      <ApplyLeaveModal 
        show={true} 
        onClose={mockOnClose} 
        staff={mockStaff} 
        onSuccess={mockOnSuccess} 
      />
    )
    
    const reasonInput = screen.getByPlaceholderText(/enter reason for leave/i)
    fireEvent.change(reasonInput, { target: { value: 'Personal reasons' } })

    const submitButton = screen.getByRole('button', { name: /submit leave/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Failed to apply leave')
    })

    alertSpy.mockRestore()
  })

  it('shows loading state during submission', async () => {
    axios.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))

    render(
      <ApplyLeaveModal 
        show={true} 
        onClose={mockOnClose} 
        staff={mockStaff} 
        onSuccess={mockOnSuccess} 
      />
    )
    
    const reasonInput = screen.getByPlaceholderText(/enter reason for leave/i)
    fireEvent.change(reasonInput, { target: { value: 'Vacation' } })

    const submitButton = screen.getByRole('button', { name: /submit leave/i })
    fireEvent.click(submitButton)

    expect(screen.getByRole('button', { name: /submitting/i })).toBeDisabled()
  })
})
