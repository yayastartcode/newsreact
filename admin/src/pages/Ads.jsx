import { useState, useEffect } from 'react'
import api from '../services/api'

export default function Ads() {
    const [ads, setAds] = useState([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState({ name: '', position: 'header', code: '', is_active: true })
    const [editId, setEditId] = useState(null)
    const [showForm, setShowForm] = useState(false)

    useEffect(() => {
        fetchAds()
    }, [])

    const fetchAds = async () => {
        try {
            const { data } = await api.get('/admin/ads')
            setAds(data)
        } catch (error) {
            console.error('Failed to fetch:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.name || !form.code) {
            alert('Nama dan kode iklan wajib diisi')
            return
        }

        try {
            if (editId) {
                await api.put(`/admin/ads/${editId}`, form)
            } else {
                await api.post('/admin/ads', form)
            }
            resetForm()
            fetchAds()
        } catch (error) {
            alert('Gagal menyimpan')
        }
    }

    const resetForm = () => {
        setForm({ name: '', position: 'header', code: '', is_active: true })
        setEditId(null)
        setShowForm(false)
    }

    const handleEdit = (ad) => {
        setEditId(ad.id)
        setForm({
            name: ad.name,
            position: ad.position,
            code: ad.code,
            is_active: ad.is_active
        })
        setShowForm(true)
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Hapus iklan ini?')) return
        try {
            await api.delete(`/admin/ads/${id}`)
            fetchAds()
        } catch (error) {
            alert('Gagal menghapus')
        }
    }

    const positionLabels = {
        header: 'Header',
        sidebar: 'Sidebar',
        in_article: 'Dalam Artikel',
        footer: 'Footer'
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Penempatan Iklan</h1>
                <button onClick={() => setShowForm(true)} className="btn btn-primary">
                    + Tambah Iklan
                </button>
            </div>

            {showForm && (
                <div className="card mb-2">
                    <div className="card-header">{editId ? 'Edit Iklan' : 'Tambah Iklan Baru'}</div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Nama Iklan</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Google Adsense Header"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Posisi</label>
                                    <select
                                        className="form-select"
                                        value={form.position}
                                        onChange={(e) => setForm({ ...form, position: e.target.value })}
                                    >
                                        <option value="header">Header</option>
                                        <option value="sidebar">Sidebar</option>
                                        <option value="in_article">Dalam Artikel</option>
                                        <option value="footer">Footer</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Kode Iklan (HTML/JavaScript)</label>
                                <textarea
                                    className="form-textarea"
                                    style={{ minHeight: '150px', fontFamily: 'monospace', fontSize: '0.875rem' }}
                                    value={form.code}
                                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                                    placeholder="<script>...</script>"
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={form.is_active}
                                        onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                    />
                                    Aktif
                                </label>
                            </div>
                            <div className="flex gap-1">
                                <button type="submit" className="btn btn-primary">
                                    {editId ? 'Update' : 'Tambah'}
                                </button>
                                <button type="button" onClick={resetForm} className="btn btn-secondary">
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nama</th>
                            <th>Posisi</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4">Loading...</td></tr>
                        ) : ads.length === 0 ? (
                            <tr><td colSpan="4" className="text-center text-light">Belum ada iklan</td></tr>
                        ) : ads.map((ad) => (
                            <tr key={ad.id}>
                                <td>{ad.name}</td>
                                <td>{positionLabels[ad.position]}</td>
                                <td>
                                    <span className={`badge badge-${ad.is_active ? 'success' : 'danger'}`}>
                                        {ad.is_active ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </td>
                                <td className="text-right">
                                    <button onClick={() => handleEdit(ad)} className="btn btn-sm btn-secondary">Edit</button>
                                    <button onClick={() => handleDelete(ad.id)} className="btn btn-sm btn-danger" style={{ marginLeft: '0.5rem' }}>Hapus</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
