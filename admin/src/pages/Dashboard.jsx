import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalArticles: 0,
        publishedArticles: 0,
        draftArticles: 0,
        totalViews: 0
    })
    const [recentArticles, setRecentArticles] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const { data } = await api.get('/admin/articles?limit=5')

            const published = data.articles.filter(a => a.status === 'published').length
            const drafts = data.articles.filter(a => a.status === 'draft').length
            const views = data.articles.reduce((sum, a) => sum + (a.view_count || 0), 0)

            setStats({
                totalArticles: data.articles.length,
                publishedArticles: published,
                draftArticles: drafts,
                totalViews: views
            })
            setRecentArticles(data.articles.slice(0, 5))
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '-'
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <Link to="/articles/new" className="btn btn-primary">
                    + Artikel Baru
                </Link>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">Total Artikel</div>
                    <div className="stat-value">{stats.totalArticles}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Published</div>
                    <div className="stat-value" style={{ color: '#10b981' }}>{stats.publishedArticles}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Draft</div>
                    <div className="stat-value" style={{ color: '#f59e0b' }}>{stats.draftArticles}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Views</div>
                    <div className="stat-value">{stats.totalViews.toLocaleString()}</div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">Artikel Terbaru</div>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Judul</th>
                            <th>Status</th>
                            <th>Views</th>
                            <th>Tanggal</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentArticles.map((article) => (
                            <tr key={article.id}>
                                <td>{article.title}</td>
                                <td>
                                    <span className={`badge badge-${article.status === 'published' ? 'success' : 'warning'}`}>
                                        {article.status}
                                    </span>
                                </td>
                                <td>{article.view_count?.toLocaleString() || 0}</td>
                                <td>{formatDate(article.published_at || article.created_at)}</td>
                                <td className="text-right">
                                    <Link to={`/articles/${article.id}/edit`} className="btn btn-sm btn-secondary">
                                        Edit
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
