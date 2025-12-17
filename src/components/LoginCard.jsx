import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import axios from 'axios'
import { API_BASE_URL } from '../config/api'
import './LoginCard.css'

function LoginCard() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [usernameError, setUsernameError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token')
    if (token) {
      navigate('/dashboard')
    }

    // Load remembered username
    const rememberedUsername = localStorage.getItem('rememberedUsername')
    if (rememberedUsername) {
      setUsername(rememberedUsername)
      setRememberMe(true)
    }
  }, [navigate])

  const validateUsername = (username) => {
    if (!username) {
      setUsernameError('Username is required')
      return false
    } else if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters')
      return false
    }
    setUsernameError('')
    return true
  }

  const validatePassword = (password) => {
    if (!password) {
      setPasswordError('Password is required')
      return false
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return false
    }
    setPasswordError('')
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    console.log('Form submitted with:', { username, password })

    // Validate inputs
    const isUsernameValid = validateUsername(username)
    const isPasswordValid = validatePassword(password)

    console.log('Validation results:', { isUsernameValid, isPasswordValid })

    if (!isUsernameValid || !isPasswordValid) {
      console.log('Validation failed, stopping')
      return
    }

    setLoading(true)
    console.log('Making API call to login...')
    console.log('Username value:', username, 'Length:', username.length)
    console.log('Password value:', password, 'Length:', password.length)

    const payload = {
      userName: username.trim(),  // Backend expects 'userName' with capital N
      password: password.trim()
    }
    console.log('Sending payload:', JSON.stringify(payload))

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('Full API Response:', response)
      console.log('Response data:', response.data)

      // Handle successful login - backend returns: { success: true, data: { token, user info } }
      if (response.data.success && response.data.data?.token) {
        const token = response.data.data.token
        const userData = {
          id: response.data.data._id,
          name: response.data.data.name,
          userName: response.data.data.userName,
          email: response.data.data.email
        }

        console.log('Token found:', token)
        console.log('User data:', userData)
        
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))
        
        // Handle remember me
        if (rememberMe) {
          localStorage.setItem('rememberedUsername', username)
        } else {
          localStorage.removeItem('rememberedUsername')
        }
        
        console.log('Navigating to dashboard...')
        navigate('/dashboard', { replace: true })
      } else {
        console.error('Unexpected response structure:', JSON.stringify(response.data, null, 2))
        setError('Login failed: Invalid response from server')
      }
    } catch (err) {
      // Handle errors
      console.error('Login error:', err)
      console.error('Error response:', err.response?.data)
      if (err.response) {
        // Server responded with error
        setError(err.response.data.message || 'Invalid username or password')
      } else if (err.request) {
        // Request made but no response
        setError('Cannot connect to server. Please try again.')
      } else {
        // Other errors
        setError('An error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      {/* Logo Section */}
      <div className="logo-section">
        <div className="logo-icon">
          <LogIn />
        </div>
        <h1 className="app-title">MyApp</h1>
      </div>

      {/* Login Card */}
      <div className="login-card">
        <div className="login-card-inner">
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Error Message */}
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {/* Username Input */}
            <div className="form-group">
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setUsernameError('')
                  setError('')
                }}
                onBlur={() => validateUsername(username)}
                placeholder="Username"
                className={`input-field ${usernameError ? 'error' : ''}`}
              />
              {usernameError && (
                <p className="field-error">
                  {usernameError}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="form-group">
              <div className="password-container">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setPasswordError('')
                    setError('')
                  }}
                  onBlur={() => validatePassword(password)}
                  placeholder="Password"
                  className={`input-field ${passwordError ? 'error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {passwordError && (
                <p className="field-error">
                  {passwordError}
                </p>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="login-button"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>

            {/* Forgot Password */}
            <div className="forgot-password">
              <a href="#">Forgotten password?</a>
            </div>
          </form>
        </div>
      </div>

      {/* Create Account Button */}
      <div className="create-account-card">
        <button
          type="button"
          onClick={() => window.location.href = '#'}
          className="create-account-button"
        >
          Create new account
        </button>
      </div>
    </div>
  )
}

export default LoginCard
