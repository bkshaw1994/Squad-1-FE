import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '../../config/api'
import LoginCard from '../LoginCard'

jest.mock('axios')

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString()
    }),
    removeItem: jest.fn((key) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
  }
})()

// Mock localStorage using Object.defineProperty
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

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
    // Clear localStorage to ensure no remembered username
    localStorage.clear()
    
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
        { 
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000
        }
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

  it('validates username length', async () => {
    render(<MockLoginCard />)
    
    const usernameInput = screen.getByPlaceholderText(/username/i)
    const loginButton = screen.getByRole('button', { name: /log in/i })
    
    // Test username too short
    fireEvent.change(usernameInput, { target: { value: 'ab' } })
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument()
    })
  })

  it('validates password length', async () => {
    render(<MockLoginCard />)
    
    const usernameInput = screen.getByPlaceholderText(/username/i)
    const passwordInput = screen.getByPlaceholderText(/password/i)
    const loginButton = screen.getByRole('button', { name: /log in/i })
    
    // Test password too short
    fireEvent.change(usernameInput, { target: { value: 'validuser' } })
    fireEvent.change(passwordInput, { target: { value: '12345' } })
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument()
    })
  })

  it('loads remembered username on mount', () => {
    const rememberedUsername = 'remembereduser'
    localStorage.setItem('rememberedUsername', rememberedUsername)
    
    render(<MockLoginCard />)
    
    const usernameInput = screen.getByPlaceholderText(/username/i)
    
    expect(usernameInput.value).toBe(rememberedUsername)
  })

  it('removes remembered username when login is successful', async () => {
    // Start with remembered username
    localStorage.setItem('rememberedUsername', 'olduser')

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
    axios.post.mockResolvedValue(mockResponse)

    render(<MockLoginCard />)
    
    const usernameInput = screen.getByPlaceholderText(/username/i)
    const passwordInput = screen.getByPlaceholderText(/password/i)
    const loginButton = screen.getByRole('button', { name: /log in/i })
    
    fireEvent.change(usernameInput, { target: { value: 'johndoe' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('rememberedUsername', 'johndoe')
    })
  })

  it('clears errors when user starts typing', () => {
    render(<MockLoginCard />)
    
    const usernameInput = screen.getByPlaceholderText(/username/i)
    const loginButton = screen.getByRole('button', { name: /log in/i })
    
    // Trigger validation error
    fireEvent.click(loginButton)
    
    // Start typing to clear error
    fireEvent.change(usernameInput, { target: { value: 'a' } })
    
    expect(screen.queryByText(/username is required/i)).not.toBeInTheDocument()
  })
})
