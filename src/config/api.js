// API configuration
export const API_BASE_URL = import.meta.env.VITE_USE_LOCAL_API === 'true'
  ? 'http://localhost:3000'
  : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000')

// CORS troubleshooting helper
export const checkCORSConfiguration = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.ok
  } catch (error) {
    console.error('CORS check failed:', error)
    return false
  }
}