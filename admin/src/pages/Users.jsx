import { useState, useEffect } from 'react'
import api from '../services/api'

export default function Users() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'author' })
    const [editId, setEditId] = useState(null)
    const [showForm, setShowForm] = useState(false)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/admin/users')
            setUsers(data)
        } catch (error) {
            console.error('Failed to fetch:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.name || !form.email || (!editId && !form.password)) {
            alert('Nama, email, dan password wajib diisi')
            return
        }

        try {
            if (editId) {
                await api.put(`/admin/users/${editId}`, form)
            } else {
                await api.post('/admin/users', form)
            }
            resetForm()
            fetchUsers()
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal menyimpan')
        }
    }

    const resetForm = () => {
        setForm({ name: '', email: '', password: '', role: 'author' })
        setEditId(null)
        setShowForm(false)
    }

    const handleEdit = (user) => {
        setEditId(user.id)
        setForm({ name: user.name, email: user.email, password: '', role: user.role })
        setShowForm(true)
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Hapus user ini?')) return
        try {
            await api.delete(`/admin/users/${id}`)
            fetchUsers()
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal menghapus')
        }
    }

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Users</h1>
                <button onClick={() => setShowForm(true)} className="btn btn-primary">
                    + Tambah User
                </button>
            </div>

            {showForm && (
                <div className="card mb-2">
                    <div className="card-header">{editId ? 'Edit User' : 'Tambah User Baru'}</div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Nama</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Password {editId && '(kosongkan jika tidak diubah)'}</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Role</label>
                                    <select
                                        className="form-select"
                                        value={form.role}
                                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                                    >
                                        <option value="author">Author</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
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
                            <th>Email</th>
                            <th>Role</th>
                            <th>Bergabung</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5">Loading...</td></tr>
                        ) : users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`badge badge-${user.role === 'admin' ? 'success' : 'warning'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td>{formatDate(user.created_at)}</td>
                                <td className="text-right">
                                    <button onClick={() => handleEdit(user)} className="btn btn-sm btn-secondary">Edit</button>
                                    <button onClick={() => handleDelete(user.id)} className="btn btn-sm btn-danger" style={{ marginLeft: '0.5rem' }}>Hapus</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
