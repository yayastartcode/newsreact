import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
    const { login } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

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

    return (
        <div className="login-page">
            <div className="login-box">
                <h1 className="login-title">
                    News<span style={{ color: '#2563eb' }}>React</span> Admin
                </h1>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@news.com"
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

                <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748b', textAlign: 'center' }}>
                    Default: admin@news.com / admin123
                </p>
            </div>
        </div>
    )
}
