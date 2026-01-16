import { useState, useEffect } from 'react'
import api from '../services/api'

export default function Tags() {
    const [tags, setTags] = useState([])
    const [loading, setLoading] = useState(true)
    const [name, setName] = useState('')
    const [editId, setEditId] = useState(null)

    useEffect(() => {
        fetchTags()
    }, [])

    const fetchTags = async () => {
        try {
            const { data } = await api.get('/tags')
            setTags(data)
        } catch (error) {
            console.error('Failed to fetch:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!name) return

        try {
            if (editId) {
                await api.put(`/admin/tags/${editId}`, { name })
            } else {
                await api.post('/admin/tags', { name })
            }
            setName('')
            setEditId(null)
            fetchTags()
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal menyimpan')
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Hapus tag ini?')) return
        try {
            await api.delete(`/admin/tags/${id}`)
            fetchTags()
        } catch (error) {
            alert('Gagal menghapus')
        }
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Tags</h1>
            </div>

            <div className="grid-2">
                <div className="card">
                    <div className="card-header">{editId ? 'Edit Tag' : 'Tambah Tag'}</div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Nama Tag</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nama tag"
                                />
                            </div>
                            <div className="flex gap-1">
                                <button type="submit" className="btn btn-primary">
                                    {editId ? 'Update' : 'Tambah'}
                                </button>
                                {editId && (
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => { setEditId(null); setName('') }}
                                    >
                                        Batal
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">Daftar Tags</div>
                    {loading ? (
                        <div className="card-body">Loading...</div>
                    ) : (
                        <div className="card-body">
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {tags.map((tag) => (
                                    <div
                                        key={tag.id}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.5rem 0.75rem',
                                            background: '#f1f5f9',
                                            borderRadius: '9999px',
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        <span>{tag.name}</span>
                                        <span style={{ color: '#64748b' }}>({tag.article_count || 0})</span>
                                        <button
                                            onClick={() => { setEditId(tag.id); setName(tag.name) }}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                        >✏️</button>
                                        <button
                                            onClick={() => handleDelete(tag.id)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                        >🗑️</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
