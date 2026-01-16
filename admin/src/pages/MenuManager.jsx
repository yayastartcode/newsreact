import { useState, useEffect } from 'react'
import api from '../services/api'

export default function MenuManager() {
    const [items, setItems] = useState([])
    const [pages, setPages] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [activeLocation, setActiveLocation] = useState('header')

    const [form, setForm] = useState({
        title: '',
        url: '',
        type: 'custom',
        reference_id: '',
        parent_id: '',
        target: '_self'
    })

    useEffect(() => {
        fetchData()
    }, [activeLocation])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [menuRes, pagesRes, catsRes] = await Promise.all([
                api.get(`/admin/menu?location=${activeLocation}`),
                api.get('/admin/pages'),
                api.get('/categories')
            ])
            setItems(menuRes.data.items)
            setPages(pagesRes.data.pages.filter(p => p.status === 'published'))
            setCategories(catsRes.data)
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target

        // Auto-fill for homepage type
        if (name === 'type' && value === 'homepage') {
            setForm(f => ({ ...f, type: value, title: 'Home', url: '/', reference_id: '' }))
            return
        }

        setForm({ ...form, [name]: value })

        // Auto-fill title when selecting page or category
        if (name === 'reference_id' && form.type === 'page') {
            const page = pages.find(p => p.id === parseInt(value))
            if (page) setForm(f => ({ ...f, title: page.title, reference_id: value }))
        }
        if (name === 'reference_id' && form.type === 'category') {
            const cat = categories.find(c => c.id === parseInt(value))
            if (cat) setForm(f => ({ ...f, title: cat.name, reference_id: value }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.title) {
            alert('Judul menu diperlukan')
            return
        }

        try {
            const payload = { ...form, menu_location: activeLocation }
            if (editingId) {
                await api.put(`/admin/menu/${editingId}`, payload)
            } else {
                await api.post('/admin/menu', payload)
            }
            resetForm()
            fetchData()
        } catch (error) {
            alert('Gagal menyimpan menu')
        }
    }

    const handleEdit = (item) => {
        setForm({
            title: item.title,
            url: item.url || '',
            type: item.type,
            reference_id: item.reference_id || '',
            parent_id: item.parent_id || '',
            target: item.target
        })
        setEditingId(item.id)
        setShowForm(true)
    }

    const handleDelete = async (id) => {
        if (!confirm('Yakin ingin menghapus menu ini?')) return

        try {
            await api.delete(`/admin/menu/${id}`)
            fetchData()
        } catch (error) {
            alert('Gagal menghapus menu')
        }
    }

    const handleMoveUp = async (index) => {
        if (index === 0) return
        const newItems = [...items]
        const temp = newItems[index]
        newItems[index] = newItems[index - 1]
        newItems[index - 1] = temp

        await saveOrder(newItems)
    }

    const handleMoveDown = async (index) => {
        if (index === items.length - 1) return
        const newItems = [...items]
        const temp = newItems[index]
        newItems[index] = newItems[index + 1]
        newItems[index + 1] = temp

        await saveOrder(newItems)
    }

    const saveOrder = async (orderedItems) => {
        const reorderData = orderedItems.map((item, index) => ({
            id: item.id,
            position: index,
            parent_id: item.parent_id
        }))

        try {
            await api.put('/admin/menu/reorder', { items: reorderData })
            setItems(orderedItems)
        } catch (error) {
            alert('Gagal mengubah urutan')
        }
    }

    const resetForm = () => {
        setForm({
            title: '',
            url: '',
            type: 'custom',
            reference_id: '',
            parent_id: '',
            target: '_self'
        })
        setEditingId(null)
        setShowForm(false)
    }

    if (loading) return <div>Loading...</div>

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Pengaturan Menu</h1>
                <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
                    {showForm ? 'Tutup Form' : '+ Tambah Menu'}
                </button>
            </div>

            <div className="tabs" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                <button
                    onClick={() => { setActiveLocation('header'); setEditingId(null); setShowForm(false); }}
                    style={{
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        background: 'none',
                        borderBottom: activeLocation === 'header' ? '2px solid #2563eb' : '2px solid transparent',
                        cursor: 'pointer',
                        fontWeight: activeLocation === 'header' ? '600' : '400',
                        color: activeLocation === 'header' ? '#2563eb' : '#64748b'
                    }}
                >
                    Header Menu
                </button>
                <button
                    onClick={() => { setActiveLocation('footer'); setEditingId(null); setShowForm(false); }}
                    style={{
                        padding: '0.75rem 1.5rem',
                        border: 'none',
                        background: 'none',
                        borderBottom: activeLocation === 'footer' ? '2px solid #2563eb' : '2px solid transparent',
                        cursor: 'pointer',
                        fontWeight: activeLocation === 'footer' ? '600' : '400',
                        color: activeLocation === 'footer' ? '#2563eb' : '#64748b'
                    }}
                >
                    Footer Menu
                </button>
            </div>

            {showForm && (
                <div className="card mb-2">
                    <div className="card-header">{editingId ? 'Edit Menu' : 'Tambah Menu Baru'}</div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="grid-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Tipe</label>
                                    <select name="type" className="form-select" value={form.type} onChange={handleChange}>
                                        <option value="homepage">Homepage</option>
                                        <option value="custom">Custom Link</option>
                                        <option value="page">Halaman</option>
                                        <option value="category">Kategori</option>
                                    </select>
                                </div>

                                {form.type === 'page' && (
                                    <div className="form-group">
                                        <label className="form-label">Pilih Halaman</label>
                                        <select name="reference_id" className="form-select" value={form.reference_id} onChange={handleChange}>
                                            <option value="">-- Pilih halaman --</option>
                                            {pages.map(p => (
                                                <option key={p.id} value={p.id}>{p.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {form.type === 'category' && (
                                    <div className="form-group">
                                        <label className="form-label">Pilih Kategori</label>
                                        <select name="reference_id" className="form-select" value={form.reference_id} onChange={handleChange}>
                                            <option value="">-- Pilih kategori --</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {form.type === 'custom' && (
                                    <div className="form-group">
                                        <label className="form-label">URL</label>
                                        <input
                                            type="text"
                                            name="url"
                                            className="form-input"
                                            placeholder="https://..."
                                            value={form.url}
                                            onChange={handleChange}
                                        />
                                    </div>
                                )}

                                <div className="form-group">
                                    <label className="form-label">Judul Menu</label>
                                    <input
                                        type="text"
                                        name="title"
                                        className="form-input"
                                        value={form.title}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Target</label>
                                    <select name="target" className="form-select" value={form.target} onChange={handleChange}>
                                        <option value="_self">Same Window</option>
                                        <option value="_blank">New Tab</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Parent Menu</label>
                                    <select name="parent_id" className="form-select" value={form.parent_id} onChange={handleChange}>
                                        <option value="">-- Top Level --</option>
                                        {items.filter(i => !i.parent_id && i.id !== editingId).map(i => (
                                            <option key={i.id} value={i.id}>{i.title}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-1" style={{ marginTop: '1rem' }}>
                                <button type="submit" className="btn btn-primary">
                                    {editingId ? 'Update' : 'Tambah'}
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
                            <th style={{ width: '50px' }}>Urutan</th>
                            <th>Judul</th>
                            <th>Tipe</th>
                            <th>URL</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                                    Belum ada menu
                                </td>
                            </tr>
                        ) : (
                            items.map((item, index) => (
                                <tr key={item.id} style={item.parent_id ? { background: '#f9f9f9' } : {}}>
                                    <td>
                                        <div className="flex gap-05">
                                            <button
                                                onClick={() => handleMoveUp(index)}
                                                className="btn btn-small"
                                                disabled={index === 0}
                                            >
                                                ↑
                                            </button>
                                            <button
                                                onClick={() => handleMoveDown(index)}
                                                className="btn btn-small"
                                                disabled={index === items.length - 1}
                                            >
                                                ↓
                                            </button>
                                        </div>
                                    </td>
                                    <td>
                                        {item.parent_id && '└─ '}
                                        {item.title}
                                    </td>
                                    <td>
                                        <span className="badge">
                                            {item.type === 'homepage' ? 'Homepage'
                                                : item.type === 'page' ? 'Halaman'
                                                    : item.type === 'category' ? 'Kategori'
                                                        : 'Custom'}
                                        </span>
                                    </td>
                                    <td>
                                        <code style={{ fontSize: '0.8rem' }}>
                                            {item.type === 'homepage' ? '/'
                                                : item.type === 'page' ? `/p/${item.page_title?.toLowerCase().replace(/\s+/g, '-')}`
                                                    : item.type === 'category' ? `/kategori/${item.category_name?.toLowerCase().replace(/\s+/g, '-')}`
                                                        : item.url}
                                        </code>
                                    </td>
                                    <td>
                                        <div className="flex gap-05">
                                            <button onClick={() => handleEdit(item)} className="btn btn-small btn-secondary">
                                                Edit
                                            </button>
                                            <button onClick={() => handleDelete(item.id)} className="btn btn-small btn-danger">
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
