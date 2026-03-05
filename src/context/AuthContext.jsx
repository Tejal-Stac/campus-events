import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../api/authService'
import { userService } from '../api/userService'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount, check localStorage for existing token
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')

        if (storedToken && storedUser) {
          setToken(storedToken)
          
          // Verify token by fetching fresh user data from API
          try {
            const freshUserData = await userService.getProfile()
            setUser(freshUserData)
            // Update localStorage with fresh data
            localStorage.setItem('user', JSON.stringify(freshUserData))
          } catch (err) {
            // Token invalid or expired, clear everything
            console.error('Token verification failed:', err)
            logout()
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const { token, user } = await authService.login(email, password)
      setToken(token)
      setUser(user)
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      return user
    } catch (error) {
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const { token, user } = await authService.register(userData)
      setToken(token)
      setUser(user)
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      return user
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    authService.logout()
  }

  const updateUserPoints = async () => {
    try {
      const freshUserData = await userService.getProfile()
      setUser(freshUserData)
      localStorage.setItem('user', JSON.stringify(freshUserData))
    } catch (error) {
      console.error('Failed to update user points:', error)
    }
  }

  // Refresh user data from backend (call after any operation that changes user state)
  const refreshUser = async () => {
    try {
      const freshUserData = await userService.getProfile()
      setUser(freshUserData)
      localStorage.setItem('user', JSON.stringify(freshUserData))
      return freshUserData
    } catch (error) {
      console.error('Failed to refresh user:', error)
      throw error
    }
  }

  const isAuthenticated = () => {
    return !!token && !!user
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUserPoints,
    refreshUser,
    isAuthenticated,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
