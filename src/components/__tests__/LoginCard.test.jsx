import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '../../config/api'
import LoginCard from '../LoginCard'

jest.mock('axios')

const MockLoginCard = () => (
  <BrowserRouter>
    <LoginCard />
  </BrowserRouter>
)

describe('LoginCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('renders login form with username and password fields', () => {
    render(<MockLoginCard />)
    
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
  })

  it('displays error message when fields are empty', async () => {
    render(<MockLoginCard />)
    
    const loginButton = screen.getByRole('button', { name: /log in/i })
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid credentials', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          token: 'mock-token-123',
          name: 'John Doe',
          userName: 'johndoe',
          email: 'john@example.com'
        }
      }
    }

    axios.post.mockResolvedValueOnce(mockResponse)

    render(<MockLoginCard />)
    
    const usernameInput = screen.getByPlaceholderText(/username/i)
    const passwordInput = screen.getByPlaceholderText(/password/i)
    const loginButton = screen.getByRole('button', { name: /log in/i })

    fireEvent.change(usernameInput, { target: { value: 'johndoe' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/auth/login`,
        { userName: 'johndoe', password: 'password123' },
        { headers: { 'Content-Type': 'application/json' } }
      )
      expect(localStorage.getItem('token')).toBe('mock-token-123')
      expect(localStorage.getItem('user')).toBeTruthy()
    })
  })

  it('displays error message on API failure', async () => {
    const mockError = {
      response: {
        data: {
          message: 'Invalid credentials'
        }
      }
    }

    axios.post.mockRejectedValueOnce(mockError)

    render(<MockLoginCard />)
    
    const usernameInput = screen.getByPlaceholderText(/username/i)
    const passwordInput = screen.getByPlaceholderText(/password/i)
    const loginButton = screen.getByRole('button', { name: /log in/i })

    fireEvent.change(usernameInput, { target: { value: 'wronguser' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } })
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })

  it('shows loading state during submission', async () => {
    axios.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))

    render(<MockLoginCard />)
    
    const usernameInput = screen.getByPlaceholderText(/username/i)
    const passwordInput = screen.getByPlaceholderText(/password/i)
    const loginButton = screen.getByRole('button', { name: /log in/i })

    fireEvent.change(usernameInput, { target: { value: 'johndoe' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(loginButton)

    expect(screen.getByRole('button', { name: /logging in/i })).toBeInTheDocument()
  })

  it('toggles password visibility', () => {
    render(<MockLoginCard />)
    
    const passwordInput = screen.getByPlaceholderText(/password/i)
    expect(passwordInput).toHaveAttribute('type', 'password')

    const toggleButton = screen.getByRole('button', { name: /show password/i })
    fireEvent.click(toggleButton)

    expect(passwordInput).toHaveAttribute('type', 'text')
  })
})
