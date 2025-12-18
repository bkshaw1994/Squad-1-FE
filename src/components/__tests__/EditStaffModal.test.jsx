import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import axios from 'axios'
import { API_BASE_URL } from '../../config/api'
import EditStaffModal from '../EditStaffModal'

jest.mock('axios')

// Mock alert using Object.defineProperty
Object.defineProperty(window, 'alert', {
  value: jest.fn(),
  writable: true,
})

describe('EditStaffModal Component', () => {
  const mockStaff = {
    _id: 'staff123',
    name: 'John Doe',
    date: '2025-12-15',
    shift: 'Morning'
  }
  const mockOnClose = jest.fn()
  const mockOnSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.setItem('token', 'mock-token')
  })

  it('does not render when show is false', () => {
    const { container } = render(
      <EditStaffModal 
        show={false} 
        onClose={mockOnClose} 
        staff={mockStaff} 
        onSuccess={mockOnSuccess} 
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders modal with staff information', () => {
    render(
      <EditStaffModal 
        show={true} 
        onClose={mockOnClose} 
        staff={mockStaff} 
        onSuccess={mockOnSuccess} 
      />
    )
    
    expect(screen.getByText('Edit Staff Schedule')).toBeInTheDocument()
    expect(screen.getByDisplayValue(mockStaff.name)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument()
  })

  it('populates form with staff data', () => {
    render(
      <EditStaffModal 
        show={true} 
        onClose={mockOnClose} 
        staff={mockStaff} 
        onSuccess={mockOnSuccess} 
      />
    )
    
    const dateInput = screen.getByDisplayValue(mockStaff.date)
    const shiftSelect = screen.getByDisplayValue('Morning')

    expect(dateInput).toHaveValue(mockStaff.date)
    expect(shiftSelect).toBeInTheDocument()
  })

  it('has minimum date restriction set to today', () => {
    render(
      <EditStaffModal 
        show={true} 
        onClose={mockOnClose} 
        staff={mockStaff} 
        onSuccess={mockOnSuccess} 
      />
    )
    
    const dateInput = screen.getByDisplayValue(mockStaff.date)
    const today = new Date().toISOString().split('T')[0]
    
    expect(dateInput).toHaveAttribute('min', today)
    expect(dateInput).toHaveAttribute('type', 'date')
  })

  it('allows changing shift selection', () => {
    render(
      <EditStaffModal 
        show={true} 
        onClose={mockOnClose} 
        staff={mockStaff} 
        onSuccess={mockOnSuccess} 
      />
    )
    
    const shiftSelect = screen.getByRole('combobox')
    
    fireEvent.change(shiftSelect, { target: { value: 'evening' } })
    
    expect(shiftSelect).toHaveValue('evening')
  })

  it('closes modal when clicking cancel', () => {
    render(
      <EditStaffModal 
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

  it('submits updated staff schedule successfully', async () => {
    axios.put.mockResolvedValueOnce({ data: { success: true } })

    render(
      <EditStaffModal 
        show={true} 
        onClose={mockOnClose} 
        staff={mockStaff} 
        onSuccess={mockOnSuccess} 
      />
    )
    
    const shiftSelect = screen.getByRole('combobox')
    const saveButton = screen.getByRole('button', { name: /save changes/i })

    fireEvent.change(shiftSelect, { target: { value: 'afternoon' } })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/staff/${mockStaff._id}`,
        {
          date: expect.any(String),
          shift: 'Afternoon'
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

  it('capitalizes shift value before sending to API', async () => {
    axios.put.mockResolvedValueOnce({ data: { success: true } })

    render(
      <EditStaffModal 
        show={true} 
        onClose={mockOnClose} 
        staff={mockStaff} 
        onSuccess={mockOnSuccess} 
      />
    )
    
    const shiftSelect = screen.getByRole('combobox')
    const saveButton = screen.getByRole('button', { name: /save changes/i })

    fireEvent.change(shiftSelect, { target: { value: 'night' } })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          shift: 'Night'
        }),
        expect.any(Object)
      )
    })
  })

  it('handles API error gracefully', async () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})
    axios.put.mockRejectedValueOnce(new Error('Update failed'))

    render(
      <EditStaffModal 
        show={true} 
        onClose={mockOnClose} 
        staff={mockStaff} 
        onSuccess={mockOnSuccess} 
      />
    )
    
    const saveButton = screen.getByRole('button', { name: /save changes/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Failed to update staff schedule')
    })

    alertSpy.mockRestore()
  })

  it('disables buttons during loading', async () => {
    axios.put.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))

    render(
      <EditStaffModal 
        show={true} 
        onClose={mockOnClose} 
        staff={mockStaff} 
        onSuccess={mockOnSuccess} 
      />
    )
    
    const saveButton = screen.getByRole('button', { name: /save changes/i })
    fireEvent.click(saveButton)

    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
  })

  it('displays all shift options', () => {
    render(
      <EditStaffModal 
        show={true} 
        onClose={mockOnClose} 
        staff={mockStaff} 
        onSuccess={mockOnSuccess} 
      />
    )
    
    const shiftSelect = screen.getByRole('combobox')
    const options = Array.from(shiftSelect.querySelectorAll('option'))
    
    expect(options).toHaveLength(4)
    expect(options.map(o => o.value)).toEqual(['morning', 'afternoon', 'evening', 'night'])
  })
})
