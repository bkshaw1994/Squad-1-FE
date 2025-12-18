import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import axios from 'axios'
import AddStaffModal from '../AddStaffModal'

// Mock localStorage before importing the component
const localStorageMock = {
  getItem: jest.fn((key) => {
    if (key === 'token') return 'mock-token-123'
    return null
  }),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

// Mock localStorage using Object.defineProperty
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock axios
jest.mock('axios')
const mockedAxios = axios

// Mock alert using Object.defineProperty
Object.defineProperty(window, 'alert', {
  value: jest.fn(),
  writable: true,
})

const mockToken = 'mock-token-123'

describe('AddStaffModal Component', () => {
  const mockProps = {
    show: true,
    onClose: jest.fn(),
    onSuccess: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // localStorage mock is already set up to return token for 'token' key
    mockedAxios.post.mockResolvedValue({
      data: { success: true, message: 'Staff added successfully' }
    })
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  it('renders the modal when show is true', () => {
    render(<AddStaffModal {...mockProps} />)

    expect(screen.getByText('Add New Staff')).toBeInTheDocument()
    expect(screen.getByText('Staff Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Role')).toBeInTheDocument()
    expect(screen.getByText('Start Date')).toBeInTheDocument()
    expect(screen.getByText('Shift')).toBeInTheDocument()
  })

  it('does not render when show is false', () => {
    render(<AddStaffModal {...mockProps} show={false} />)

    expect(screen.queryByText('Add New Staff')).not.toBeInTheDocument()
  })

  it('closes modal when close button is clicked', () => {
    render(<AddStaffModal {...mockProps} />)

    const closeButton = document.querySelector('.close-btn')
    fireEvent.click(closeButton)

    expect(mockProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('closes modal when Cancel button is clicked', () => {
    render(<AddStaffModal {...mockProps} />)

    const cancelButton = screen.getByText('Cancel')
    fireEvent.click(cancelButton)

    expect(mockProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('submits form with valid data successfully', async () => {
    render(<AddStaffModal {...mockProps} />)

    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText('Enter staff name'), {
      target: { value: 'John Doe' }
    })
    fireEvent.change(screen.getByPlaceholderText('Enter email'), {
      target: { value: 'john@example.com' }
    })
    fireEvent.change(screen.getAllByRole('combobox')[0], {
      target: { value: 'Doctor' }
    })
    fireEvent.change(screen.getAllByRole('combobox')[1], {
      target: { value: 'morning' }
    })

    // Submit the form
    const submitButton = screen.getByText('Add Staff')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/staff',
        {
          name: 'John Doe',
          email: 'john@example.com',
          role: 'Doctor',
          shift: 'Morning',
          date: expect.any(String)
        },
        {
          headers: {
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000
        }
      )
    })

    expect(global.alert).toHaveBeenCalledWith('Staff added successfully!')
    expect(mockProps.onSuccess).toHaveBeenCalledTimes(1)
    expect(mockProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('submits form without email when email is not provided', async () => {
    render(<AddStaffModal {...mockProps} />)

    // Fill out the form without email
    fireEvent.change(screen.getByPlaceholderText('Enter staff name'), {
      target: { value: 'Jane Smith' }
    })
    fireEvent.change(screen.getAllByRole('combobox')[0], {
      target: { value: 'Nurse' }
    })
    fireEvent.change(screen.getAllByRole('combobox')[1], {
      target: { value: 'evening' }
    })

    // Submit the form
    const submitButton = screen.getByText('Add Staff')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3000/api/staff',
        {
          name: 'Jane Smith',
          role: 'Nurse',
          shift: 'Evening',
          date: expect.any(String)
        },
        expect.any(Object)
      )
    })
  })

  it('handles network error', async () => {
    const networkError = new Error('Network Error')
    networkError.code = 'NETWORK_ERROR'
    mockedAxios.post.mockRejectedValue(networkError)

    render(<AddStaffModal {...mockProps} />)

    // Fill out minimal form
    fireEvent.change(screen.getByPlaceholderText('Enter staff name'), {
      target: { value: 'Test User' }
    })
    fireEvent.change(screen.getAllByRole('combobox')[0], {
      target: { value: 'Doctor' }
    })
    fireEvent.change(screen.getAllByRole('combobox')[1], {
      target: { value: 'morning' }
    })

    // Submit the form
    const submitButton = screen.getByText('Add Staff')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Network error: Cannot connect to server. Please check your internet connection.')
    })

    expect(mockProps.onSuccess).not.toHaveBeenCalled()
    expect(mockProps.onClose).not.toHaveBeenCalled()
  })

  it('handles timeout error', async () => {
    const timeoutError = new Error('Timeout')
    timeoutError.code = 'ECONNABORTED'
    mockedAxios.post.mockRejectedValue(timeoutError)

    render(<AddStaffModal {...mockProps} />)

    // Fill out minimal form
    fireEvent.change(screen.getByPlaceholderText('Enter staff name'), {
      target: { value: 'Test User' }
    })
    fireEvent.change(screen.getAllByRole('combobox')[0], {
      target: { value: 'Doctor' }
    })
    fireEvent.change(screen.getAllByRole('combobox')[1], {
      target: { value: 'morning' }
    })

    // Submit the form
    const submitButton = screen.getByText('Add Staff')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Request timeout: Server took too long to respond.')
    })
  })

  it('handles CORS error (status 0)', async () => {
    const corsError = {
      response: { status: 0 }
    }
    mockedAxios.post.mockRejectedValue(corsError)

    render(<AddStaffModal {...mockProps} />)

    // Fill out minimal form
    fireEvent.change(screen.getByPlaceholderText('Enter staff name'), {
      target: { value: 'Test User' }
    })
    fireEvent.change(screen.getAllByRole('combobox')[0], {
      target: { value: 'Doctor' }
    })
    fireEvent.change(screen.getAllByRole('combobox')[1], {
      target: { value: 'morning' }
    })

    // Submit the form
    const submitButton = screen.getByText('Add Staff')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('CORS error: Server blocked the request. Please contact support.')
    })
  })

  it('handles authentication error (401)', async () => {
    const authError = {
      response: {
        status: 401,
        data: { error: 'Unauthorized' }
      }
    }
    mockedAxios.post.mockRejectedValue(authError)

    render(<AddStaffModal {...mockProps} />)

    // Fill out minimal form
    fireEvent.change(screen.getByPlaceholderText('Enter staff name'), {
      target: { value: 'Test User' }
    })
    fireEvent.change(screen.getAllByRole('combobox')[0], {
      target: { value: 'Doctor' }
    })
    fireEvent.change(screen.getAllByRole('combobox')[1], {
      target: { value: 'morning' }
    })

    // Submit the form
    const submitButton = screen.getByText('Add Staff')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Authentication error: Please log in again.')
    })
  })

  it('handles server error with custom message', async () => {
    const serverError = {
      response: {
        status: 500,
        data: { error: 'Internal server error' }
      }
    }
    mockedAxios.post.mockRejectedValue(serverError)

    render(<AddStaffModal {...mockProps} />)

    // Fill out minimal form
    fireEvent.change(screen.getByPlaceholderText('Enter staff name'), {
      target: { value: 'Test User' }
    })
    fireEvent.change(screen.getAllByRole('combobox')[0], {
      target: { value: 'Doctor' }
    })
    fireEvent.change(screen.getAllByRole('combobox')[1], {
      target: { value: 'morning' }
    })

    // Submit the form
    const submitButton = screen.getByText('Add Staff')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Server error: Internal server error')
    })
  })

  it('handles generic server error', async () => {
    const genericError = {
      response: {
        status: 400,
        data: {}
      }
    }
    mockedAxios.post.mockRejectedValue(genericError)

    render(<AddStaffModal {...mockProps} />)

    // Fill out minimal form
    fireEvent.change(screen.getByPlaceholderText('Enter staff name'), {
      target: { value: 'Test User' }
    })
    fireEvent.change(screen.getAllByRole('combobox')[0], {
      target: { value: 'Doctor' }
    })
    fireEvent.change(screen.getAllByRole('combobox')[1], {
      target: { value: 'morning' }
    })

    // Submit the form
    const submitButton = screen.getByText('Add Staff')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Server error: 400')
    })
  })

  it('handles request error (no response)', async () => {
    const requestError = {
      request: {},
      message: 'Request failed'
    }
    mockedAxios.post.mockRejectedValue(requestError)

    render(<AddStaffModal {...mockProps} />)

    // Fill out minimal form
    fireEvent.change(screen.getByPlaceholderText('Enter staff name'), {
      target: { value: 'Test User' }
    })
    fireEvent.change(screen.getAllByRole('combobox')[0], {
      target: { value: 'Doctor' }
    })
    fireEvent.change(screen.getAllByRole('combobox')[1], {
      target: { value: 'morning' }
    })

    // Submit the form
    const submitButton = screen.getByText('Add Staff')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Cannot connect to server. The server may be down or there may be a network issue.')
    })
  })

  it('shows loading state during submission', async () => {
    // Make axios hang to test loading state
    mockedAxios.post.mockImplementation(() => new Promise(() => {}))

    render(<AddStaffModal {...mockProps} />)

    // Fill out minimal form
    fireEvent.change(screen.getByPlaceholderText('Enter staff name'), {
      target: { value: 'Test User' }
    })
    fireEvent.change(screen.getAllByRole('combobox')[0], {
      target: { value: 'Doctor' }
    })
    fireEvent.change(screen.getAllByRole('combobox')[1], {
      target: { value: 'morning' }
    })

    // Submit the form
    const submitButton = screen.getByText('Add Staff')
    fireEvent.click(submitButton)

    // Check loading state
    expect(screen.getByText('Adding...')).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('resets form after successful submission', async () => {
    render(<AddStaffModal {...mockProps} />)

    // Fill out the form
    const nameInput = screen.getByPlaceholderText('Enter staff name')
    const emailInput = screen.getByPlaceholderText('Enter email')

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'Doctor' } })
    fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: 'morning' } })

    // Submit the form
    const submitButton = screen.getByText('Add Staff')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(nameInput.value).toBe('')
      expect(emailInput.value).toBe('')
    })
  })

  it('capitalizes shift properly', async () => {
    render(<AddStaffModal {...mockProps} />)

    // Fill out the form with lowercase shift
    fireEvent.change(screen.getByPlaceholderText('Enter staff name'), {
      target: { value: 'Test User' }
    })
    fireEvent.change(screen.getAllByRole('combobox')[0], {
      target: { value: 'Doctor' }
    })
    fireEvent.change(screen.getAllByRole('combobox')[1], {
      target: { value: 'afternoon' }
    })

    // Submit the form
    const submitButton = screen.getByText('Add Staff')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ shift: 'Afternoon' }),
        expect.any(Object)
      )
    })
  })
})