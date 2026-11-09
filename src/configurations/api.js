import axios from 'axios'
import { clearSession, getToken } from './session'

const api = axios.create({ baseURL: import.meta.env.VITE_ADMIN_API })

// Every request carries the admin's session token.
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// An expired session goes back to the sign-in page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLogin = String(error.config?.url || '').endsWith('/login')
    if (error.response?.status === 401 && !isLogin) {
      clearSession()
      if (window.location.pathname !== '/login') window.location.assign('/login')
    }
    return Promise.reject(error)
  },
)

export const errorMessage = (error, fallback) => {
  const data = error.response?.data
  if (data?.message) return data.message
  return error.response ? fallback : "Can't reach the FDSC admin server. Is it running on port 5011?"
}

export default api
