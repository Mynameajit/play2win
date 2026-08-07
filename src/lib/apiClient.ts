import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
})

// Request Interceptor: Attach bearer accessToken to headers
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('play2earn_session')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (parsed.accessToken) {
            config.headers.Authorization = `Bearer ${parsed.accessToken}`
          }
        } catch (e) {
          console.error('Error parsing session tokens:', e)
        }
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Catch 401 to refresh tokens
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        // Attempt to request a new access token using refresh endpoint
        const response = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true })
        const { accessToken } = response.data

        // Save new token in session storage
        const saved = localStorage.getItem('play2earn_session')
        if (saved) {
          const session = JSON.parse(saved)
          session.accessToken = accessToken
          localStorage.setItem('play2earn_session', JSON.stringify(session))
        }

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        console.error('[API Client] Refresh token verification failed, redirecting to login...')
        if (typeof window !== 'undefined') {
          localStorage.removeItem('play2earn_session')
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
