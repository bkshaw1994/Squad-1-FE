import { render, screen } from '@testing-library/react'
import App from '../App'

// Mock the pages
jest.mock('../pages/LoginPage', () => {
  return function LoginPage() {
    return <div data-testid="login-page">Login Page</div>
  }
})

jest.mock('../pages/Dashboard', () => {
  return function Dashboard() {
    return <div data-testid="dashboard-page">Dashboard Page</div>
  }
})

jest.mock('../pages/StaffDetails', () => {
  return function StaffDetails() {
    return <div data-testid="staff-details-page">Staff Details Page</div>
  }
})

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the app with router', () => {
    const { container } = render(<App />)
    expect(container).toBeInTheDocument()
  })

  it('renders login page at root path', () => {
    window.history.pushState({}, 'Login Page', '/login')
    render(<App />)
    expect(screen.getByTestId('login-page')).toBeInTheDocument()
  })
})
