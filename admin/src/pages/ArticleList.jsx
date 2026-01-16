import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function ArticleList() {
    const navigate = useNavigate()
    const [articles, setArticles] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    useEffect(() => {
        fetchArticles()
    }, [filter])

    const fetchArticles = async () => {
        try {
            const params = filter !== 'all' ? `?status=${filter}` : ''
            const { data } = await api.get(`/admin/articles${params}`)
            setArticles(data.articles)
        } catch (error) {
            console.error('Failed to fetch articles:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Hapus artikel ini?')) return

        try {
            await api.delete(`/admin/articles/${id}`)
            setArticles(articles.filter((a) => a.id !== id))
        } catch (error) {
            alert('Gagal menghapus artikel')
        }
    }

    const toggleFeatured = async (id) => {
        try {
            const { data } = await api.patch(`/admin/articles/${id}/featured`)
            setArticles(articles.map((a) =>
                a.id === id ? { ...a, is_featured: data.is_featured } : a
            ))
        } catch (error) {
            alert('Gagal mengubah status unggulan')
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

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Artikel</h1>
                <Link to="/articles/new" className="btn btn-primary">
                    + Artikel Baru
                </Link>
            </div>

            <div className="card">
                <div className="card-header flex justify-between items-center">
                    <span>Daftar Artikel</span>
                    <select
                        className="form-select"
                        style={{ width: 'auto' }}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">Semua</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                    </select>
                </div>

                {loading ? (
                    <div className="card-body">Loading...</div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Judul</th>
                                <th>Kategori</th>
                                <th>Status</th>
                                <th>Views</th>
                                <th>Tanggal</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center text-light">
                                        Belum ada artikel
                                    </td>
                                </tr>
                            ) : (
                                articles.map((article) => (
                                    <tr key={article.id}>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{article.title}</div>
                                            <div className="text-sm text-light">{article.author_name}</div>
                                        </td>
                                        <td>{article.category_name}</td>
                                        <td>
                                            <span className={`badge badge-${article.status === 'published' ? 'success' : 'warning'}`}>
                                                {article.status}
                                            </span>
                                        </td>
                                        <td>{article.view_count?.toLocaleString() || 0}</td>
                                        <td>{formatDate(article.published_at || article.created_at)}</td>
                                        <td className="text-right">
                                            <div className="flex gap-1 justify-end">
                                                <button
                                                    onClick={() => toggleFeatured(article.id)}
                                                    className={`btn btn-sm ${article.is_featured ? 'btn-warning' : 'btn-secondary'}`}
                                                    title={article.is_featured ? 'Hapus dari unggulan' : 'Jadikan unggulan'}
                                                >
                                                    {article.is_featured ? '★' : '☆'}
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/articles/${article.id}/edit`)}
                                                    className="btn btn-sm btn-secondary"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(article.id)}
                                                    className="btn btn-sm btn-danger"
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
