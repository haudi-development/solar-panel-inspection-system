'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fixed credentials
  const VALID_CREDENTIALS = {
    username: 'admin',
    password: 'solar2024!'
  }

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = () => {
      // Check cookies for authentication
      const cookies = document.cookie.split(';').reduce((acc: Record<string, string>, cookie) => {
        const [key, value] = cookie.trim().split('=')
        acc[key] = value
        return acc
      }, {})
      
      const token = cookies['solar-auth-token']
      const tokenExpiry = cookies['solar-auth-expiry']
      
      if (token && tokenExpiry) {
        const now = new Date().getTime()
        const expiry = parseInt(tokenExpiry)
        
        if (now < expiry) {
          setIsAuthenticated(true)
        } else {
          // Token expired, clear it
          document.cookie = 'solar-auth-token=; Max-Age=0; path=/'
          document.cookie = 'solar-auth-expiry=; Max-Age=0; path=/'
        }
      }
      
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
      // Create session token (24 hours expiry)
      const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000)
      const token = btoa(`${username}:${Date.now()}`) // Simple token
      const expiryDate = new Date(expiryTime)
      
      // Set cookies with proper expiry
      document.cookie = `solar-auth-token=${token}; expires=${expiryDate.toUTCString()}; path=/; samesite=strict`
      document.cookie = `solar-auth-expiry=${expiryTime}; expires=${expiryDate.toUTCString()}; path=/; samesite=strict`
      
      setIsAuthenticated(true)
      return true
    }
    
    return false
  }

  const logout = () => {
    // Clear cookies
    document.cookie = 'solar-auth-token=; Max-Age=0; path=/'
    document.cookie = 'solar-auth-expiry=; Max-Age=0; path=/'
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      login,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  )
}