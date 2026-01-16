import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function Pages() {
    const [pages, setPages] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchPages()
    }, [])

    const fetchPages = async () => {
        try {
            const { data } = await api.get('/admin/pages')
            setPages(data.pages)
        } catch (error) {
            console.error('Failed to fetch pages:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus halaman ini?')) return

        try {
            await api.delete(`/admin/pages/${id}`)
            setPages(pages.filter(p => p.id !== id))
        } catch (error) {
            alert('Gagal menghapus halaman')
        }
    }

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    if (loading) return <div>Loading...</div>

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Halaman</h1>
                <Link to="/pages/new" className="btn btn-primary">
                    + Halaman Baru
                </Link>
            </div>

            <div className="card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Judul</th>
                            <th>Slug</th>
                            <th>Status</th>
                            <th>Tanggal</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pages.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                                    Belum ada halaman
                                </td>
                            </tr>
                        ) : (
                            pages.map((page) => (
                                <tr key={page.id}>
                                    <td>
                                        <Link to={`/pages/${page.id}`} style={{ fontWeight: 500 }}>
                                            {page.title}
                                        </Link>
                                    </td>
                                    <td>
                                        <code>/p/{page.slug}</code>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${page.status === 'published' ? 'success' : 'warning'}`}>
                                            {page.status === 'published' ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td>{formatDate(page.updated_at)}</td>
                                    <td>
                                        <div className="flex gap-05">
                                            <Link to={`/pages/${page.id}`} className="btn btn-small btn-secondary">
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(page.id)}
                                                className="btn btn-small btn-danger"
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
            </div>
        </div>
    )
}
