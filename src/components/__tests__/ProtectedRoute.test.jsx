import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../ProtectedRoute'

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders children when token exists', () => {
    localStorage.setItem('token', 'test-token')
    
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    )
    
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to login when token does not exist', () => {
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    )
    
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('does not render children when no token', () => {
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    )
    
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})
