
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import LoginPage from '../LoginPage'

const mockNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}))

// Mock the LoginCard component
jest.mock('../../components/LoginCard', () => {
  return function LoginCard() {
    return <div data-testid="login-card">Login Card Component</div>
  }
})

describe('LoginPage Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    localStorage.clear()
  })

  it('renders the login page with LoginCard', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )
    
    expect(screen.getByTestId('login-card')).toBeInTheDocument()
  })

  it('redirects to dashboard if token exists', () => {
    localStorage.setItem('token', 'test-token')
    
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )
    
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
  })

  it('does not redirect if no token', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )
    
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('has login-page class on container', () => {
    const { container } = render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )
    
    expect(container.querySelector('.login-page')).toBeInTheDocument()
  })
})
