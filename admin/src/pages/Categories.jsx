import { useState, useEffect } from 'react'
import api from '../services/api'

export default function Categories() {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState({ name: '', description: '' })
    const [editId, setEditId] = useState(null)

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories')
            setCategories(data)
        } catch (error) {
            console.error('Failed to fetch:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.name) return

        try {
            if (editId) {
                await api.put(`/admin/categories/${editId}`, form)
            } else {
                await api.post('/admin/categories', form)
            }
            setForm({ name: '', description: '' })
            setEditId(null)
            fetchCategories()
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal menyimpan')
        }
    }

    const handleEdit = (cat) => {
        setEditId(cat.id)
        setForm({ name: cat.name, description: cat.description || '' })
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Hapus kategori ini?')) return
        try {
            await api.delete(`/admin/categories/${id}`)
            fetchCategories()
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal menghapus')
        }
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Kategori</h1>
            </div>

            <div className="grid-2">
                <div className="card">
                    <div className="card-header">{editId ? 'Edit Kategori' : 'Tambah Kategori'}</div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Nama</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Nama kategori"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Deskripsi</label>
                                <textarea
                                    className="form-textarea"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Deskripsi (opsional)"
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
                                        onClick={() => { setEditId(null); setForm({ name: '', description: '' }) }}
                                    >
                                        Batal
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">Daftar Kategori</div>
                    {loading ? (
                        <div className="card-body">Loading...</div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Nama</th>
                                    <th>Artikel</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((cat) => (
                                    <tr key={cat.id}>
                                        <td>{cat.name}</td>
                                        <td>{cat.article_count || 0}</td>
                                        <td className="text-right">
                                            <button onClick={() => handleEdit(cat)} className="btn btn-sm btn-secondary">Edit</button>
                                            <button onClick={() => handleDelete(cat.id)} className="btn btn-sm btn-danger" style={{ marginLeft: '0.5rem' }}>Hapus</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}
