import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
            fetchProfile()
        } else {
            setLoading(false)
        }
    }, [])

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/auth/profile')
            setUser(data)
        } catch (error) {
            localStorage.removeItem('token')
            delete api.defaults.headers.common['Authorization']
        } finally {
            setLoading(false)
        }
    }

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password })
        localStorage.setItem('token', data.token)
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
        setUser(data.user)
        return data
    }

    const logout = () => {
        localStorage.removeItem('token')
        delete api.defaults.headers.common['Authorization']
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAdmin: user?.role === 'admin' }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}
