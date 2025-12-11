import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import LoginCard from '../components/LoginCard'
import '../components/LoginCard.css'

function LoginPage() {
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token')
    if (token) {
      navigate('/dashboard')
    }
  }, [navigate])

  return (
    <div className="login-page">
      <LoginCard />
    </div>
  )
}

export default LoginPage
