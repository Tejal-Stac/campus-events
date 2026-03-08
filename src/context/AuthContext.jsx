import { createContext, useContext, useState, useEffect } from 'react'
import authService from '../api/authService'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')

        if (storedToken && storedUser) {
          setToken(storedToken)
          setUser(JSON.parse(storedUser))
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email, password, role) => {
    try {
      const { token, user } = await authService.login(email, password, role)
      
      // Store token and user synchronously to prevent race conditions
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      // Update state synchronously
      setToken(token)
      setUser(user)
      
      console.log('✅ AuthContext: User logged in:', user)
      return user
    } catch (error) {
      console.error('❌ AuthContext: Login failed:', error)
      throw error
    }
  }

  const register = async (userData) => {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed')
    }

    return data.user
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const isAuthenticated = () => {
    return !!token && !!user
  }

  const refreshUser = () => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }

  const updateUserPoints = async () => {
    // Placeholder for updating user points after registration
    // Fetch updated user profile in the future if needed
    refreshUser()
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    refreshUser,
    updateUserPoints,
    isAuthenticated,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext