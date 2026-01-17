import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Login() {
    const { login } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [settings, setSettings] = useState({ logo: null, site_name: '' })

    useEffect(() => {
        // Fetch settings for logo
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/settings')
                setSettings(data)
            } catch (e) {
                console.error('Failed to fetch settings')
            }
        }
        fetchSettings()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await login(email, password)
        } catch (err) {
            setError(err.response?.data?.message || 'Login gagal. Silakan coba lagi.')
        } finally {
            setLoading(false)
        }
    }

    const siteName = settings.site_name || 'NewsReact'

    return (
        <div className="login-page">
            <div className="login-box">
                {settings.logo ? (
                    <div className="login-logo">
                        <img src={settings.logo} alt={siteName} style={{ maxHeight: '60px', marginBottom: '1rem' }} />
                    </div>
                ) : (
                    <h1 className="login-title">
                        {siteName} <span style={{ color: '#64748b', fontSize: '0.6em' }}>Admin</span>
                    </h1>
                )}

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@domain.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Masuk...' : 'Masuk'}
                    </button>
                </form>
            </div>
        </div>
    )
}
