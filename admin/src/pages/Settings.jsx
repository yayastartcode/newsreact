import { useState, useEffect } from 'react'
import api from '../services/api'

export default function Settings() {
    const [settings, setSettings] = useState({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploadingLogo, setUploadingLogo] = useState(null)
    const [demoStats, setDemoStats] = useState({ demoArticleCount: 0 })
    const [demoLoading, setDemoLoading] = useState(false)
    const [categories, setCategories] = useState([])

    useEffect(() => {
        fetchSettings()
        fetchDemoStats()
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/admin/categories')
            // API returns array directly
            setCategories(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Failed to fetch categories:', error)
        }
    }

    const fetchSettings = async () => {
        try {
            const { data } = await api.get('/admin/settings')
            // Convert array to object
            const settingsObj = {}
            data.settings.forEach(s => {
                settingsObj[s.setting_key] = s.setting_value || ''
            })
            setSettings(settingsObj)
        } catch (error) {
            console.error('Failed to fetch settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (key, value) => {
        setSettings({ ...settings, [key]: value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)

        try {
            await api.put('/admin/settings', { settings })
            alert('Settings berhasil disimpan!')
        } catch (error) {
            alert('Gagal menyimpan settings')
        } finally {
            setSaving(false)
        }
    }

    const handleLogoUpload = async (e, type) => {
        const file = e.target.files[0]
        if (!file) return

        setUploadingLogo(type)

        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', type)

        try {
            const { data } = await api.post('/admin/settings/logo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            setSettings({ ...settings, [type]: data.url })
        } catch (error) {
            alert('Gagal upload logo')
        } finally {
            setUploadingLogo(null)
        }
    }

    const fetchDemoStats = async () => {
        try {
            const { data } = await api.get('/admin/demo/stats')
            setDemoStats(data)
        } catch (error) {
            console.error('Failed to fetch demo stats:', error)
        }
    }

    const handleSeedDemo = async () => {
        if (!confirm('Buat 10 artikel demo? Ini akan menambah artikel contoh ke database.')) return

        setDemoLoading(true)
        try {
            const { data } = await api.post('/admin/demo/seed')
            alert(data.message)
            fetchDemoStats()
        } catch (error) {
            alert('Gagal membuat demo data')
        } finally {
            setDemoLoading(false)
        }
    }

    const handleDeleteDemo = async () => {
        if (!confirm('Hapus semua artikel demo? Tindakan ini tidak dapat dibatalkan.')) return

        setDemoLoading(true)
        try {
            const { data } = await api.delete('/admin/demo')
            alert(data.message)
            fetchDemoStats()
        } catch (error) {
            alert('Gagal menghapus demo data')
        } finally {
            setDemoLoading(false)
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Pengaturan Situs</h1>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid-3" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    {/* General Settings */}
                    <div className="card">
                        <div className="card-header">Umum</div>
                        <div className="card-body">
                            <div className="form-group">
                                <label className="form-label">Nama Situs</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={settings.site_name || ''}
                                    onChange={(e) => handleChange('site_name', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Deskripsi Situs</label>
                                <textarea
                                    className="form-textarea"
                                    rows={3}
                                    value={settings.site_description || ''}
                                    onChange={(e) => handleChange('site_description', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Footer Text</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={settings.footer_text || ''}
                                    onChange={(e) => handleChange('footer_text', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Logo Settings */}
                    <div className="card">
                        <div className="card-header">Logo & Favicon</div>
                        <div className="card-body">
                            <div className="form-group">
                                <label className="form-label">Logo</label>
                                {settings.logo && (
                                    <div style={{ marginBottom: '0.5rem', padding: '1rem', background: '#f5f5f5', borderRadius: '0.5rem' }}>
                                        <img src={settings.logo} alt="Logo" style={{ maxHeight: '60px' }} />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleLogoUpload(e, 'logo')}
                                    disabled={uploadingLogo === 'logo'}
                                />
                                {uploadingLogo === 'logo' && <span> Uploading...</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Logo (Dark Mode)</label>
                                {settings.logo_dark && (
                                    <div style={{ marginBottom: '0.5rem', padding: '1rem', background: '#1a1a1a', borderRadius: '0.5rem' }}>
                                        <img src={settings.logo_dark} alt="Logo Dark" style={{ maxHeight: '60px' }} />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleLogoUpload(e, 'logo_dark')}
                                    disabled={uploadingLogo === 'logo_dark'}
                                />
                                {uploadingLogo === 'logo_dark' && <span> Uploading...</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Favicon</label>
                                {settings.favicon && (
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <img src={settings.favicon} alt="Favicon" style={{ maxHeight: '32px' }} />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleLogoUpload(e, 'favicon')}
                                    disabled={uploadingLogo === 'favicon'}
                                />
                                {uploadingLogo === 'favicon' && <span> Uploading...</span>}
                            </div>
                        </div>
                    </div>

                    {/* Social Media */}
                    <div className="card">
                        <div className="card-header">Media Sosial</div>
                        <div className="card-body">
                            <div className="form-group">
                                <label className="form-label">Facebook</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="https://facebook.com/..."
                                    value={settings.social_facebook || ''}
                                    onChange={(e) => handleChange('social_facebook', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Twitter / X</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="https://twitter.com/..."
                                    value={settings.social_twitter || ''}
                                    onChange={(e) => handleChange('social_twitter', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Instagram</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="https://instagram.com/..."
                                    value={settings.social_instagram || ''}
                                    onChange={(e) => handleChange('social_instagram', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">YouTube</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="https://youtube.com/..."
                                    value={settings.social_youtube || ''}
                                    onChange={(e) => handleChange('social_youtube', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                    </button>
                </div>
            </form>

            {/* Homepage Settings */}
            <div className="card" style={{ marginTop: '2rem' }}>
                <div className="card-header">Pengaturan Homepage</div>
                <div className="card-body">
                    <div className="form-group">
                        <label className="form-label">Post Per Halaman</label>
                        <input
                            type="number"
                            className="form-input"
                            min="4"
                            max="24"
                            value={settings.posts_per_page || 9}
                            onChange={(e) => handleChange('posts_per_page', e.target.value)}
                            style={{ maxWidth: '120px' }}
                        />
                        <small style={{ color: '#666', marginTop: '0.25rem', display: 'block' }}>
                            Jumlah artikel yang ditampilkan per halaman (4-24).
                        </small>
                    </div>

                    <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label className="form-label">Trending Section - Kategori</label>
                        <select
                            className="form-select"
                            value={settings.trending_category || ''}
                            onChange={(e) => handleChange('trending_category', e.target.value)}
                        >
                            <option value="">Trending (Views Terbanyak)</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.slug}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        <small style={{ color: '#666', marginTop: '0.25rem', display: 'block' }}>
                            Pilih kategori untuk ditampilkan di section Trending Post, atau biarkan kosong untuk menampilkan artikel dengan views terbanyak.
                        </small>
                    </div>

                    <hr style={{ margin: '1.5rem 0', borderColor: '#e2e8f0' }} />

                    <h4 style={{ marginBottom: '1rem', fontWeight: 600 }}>3-Kolom Kategori</h4>
                    <p style={{ marginBottom: '1rem', color: '#666', fontSize: '0.875rem' }}>
                        Pilih kategori untuk ditampilkan di setiap kolom. Biarkan kosong jika tidak ingin menampilkan kolom tersebut.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Kolom 1</label>
                            <select
                                className="form-select"
                                value={settings.category_column_1 || ''}
                                onChange={(e) => handleChange('category_column_1', e.target.value)}
                            >
                                <option value="">-- Tidak ditampilkan --</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.slug}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Kolom 2</label>
                            <select
                                className="form-select"
                                value={settings.category_column_2 || ''}
                                onChange={(e) => handleChange('category_column_2', e.target.value)}
                            >
                                <option value="">-- Tidak ditampilkan --</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.slug}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Kolom 3</label>
                            <select
                                className="form-select"
                                value={settings.category_column_3 || ''}
                                onChange={(e) => handleChange('category_column_3', e.target.value)}
                            >
                                <option value="">-- Tidak ditampilkan --</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.slug}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={saving}
                        style={{ marginTop: '1rem' }}
                    >
                        {saving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </div>
            </div>

            {/* Demo Data Management */}
            <div className="card" style={{ marginTop: '2rem' }}>
                <div className="card-header">Demo Data</div>
                <div className="card-body">
                    <p style={{ marginBottom: '1rem', color: '#666' }}>
                        Kelola artikel demo untuk testing. Artikel demo akan ditandai secara khusus dan dapat dihapus sekaligus.
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{
                            padding: '0.75rem 1.5rem',
                            background: demoStats.demoArticleCount > 0 ? '#e3f2fd' : '#f5f5f5',
                            borderRadius: '0.5rem',
                            fontWeight: 500
                        }}>
                            {demoStats.demoArticleCount} artikel demo
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            onClick={handleSeedDemo}
                            className="btn btn-primary"
                            disabled={demoLoading}
                        >
                            {demoLoading ? 'Loading...' : '+ Buat 10 Artikel Demo'}
                        </button>

                        {demoStats.demoArticleCount > 0 && (
                            <button
                                onClick={handleDeleteDemo}
                                className="btn btn-danger"
                                disabled={demoLoading}
                            >
                                {demoLoading ? 'Loading...' : 'Hapus Semua Demo'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
