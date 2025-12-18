import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CreateAccount from '../components/CreateAccount'
import '../components/LoginCard.css'

function SignUp() {
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
            <CreateAccount/>
        </div>
    )
}

export default SignUp;
