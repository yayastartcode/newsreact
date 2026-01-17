import { useState, useEffect } from 'react'
import api from '../services/api'

export default function MediaLibrary() {
    const [media, setMedia] = useState([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        fetchMedia()
    }, [])

    const fetchMedia = async () => {
        try {
            const { data } = await api.get('/admin/media')
            setMedia(data.media)
        } catch (error) {
            console.error('Failed to fetch:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpload = async (e) => {
        const files = e.target.files
        if (!files.length) return

        setUploading(true)

        for (const file of files) {
            const formData = new FormData()
            formData.append('file', file)

            try {
                await api.post('/admin/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
            } catch (error) {
                alert(`Gagal upload ${file.name}`)
            }
        }

        setUploading(false)
        fetchMedia()
        e.target.value = ''
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Hapus file ini?')) return
        try {
            await api.delete(`/admin/media/${id}`)
            setMedia(media.filter(m => m.id !== id))
        } catch (error) {
            alert('Gagal menghapus')
        }
    }

    const copyToClipboard = (url) => {
        // Get site domain from API URL environment variable or current origin
        const apiUrl = import.meta.env.VITE_API_URL || ''
        // Extract base domain from API URL (remove /api suffix)
        const baseUrl = apiUrl.replace(/\/api$/, '') || window.location.origin.replace(/\/admin$/, '')
        const fullUrl = url.startsWith('http') ? url : baseUrl + url

        navigator.clipboard.writeText(fullUrl)
        alert('URL disalin: ' + fullUrl)
    }

    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Media Library</h1>
                <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
                    {uploading ? 'Uploading...' : '+ Upload File'}
                    <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={handleUpload}
                        style={{ display: 'none' }}
                        disabled={uploading}
                    />
                </label>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : media.length === 0 ? (
                <div className="card">
                    <div className="card-body text-center text-light">
                        Belum ada media. Upload file untuk memulai.
                    </div>
                </div>
            ) : (
                <div className="media-grid">
                    {media.map((item) => (
                        <div key={item.id} className="media-item">
                            {item.mime_type?.startsWith('image/') ? (
                                <img src={item.url} alt={item.original_name} />
                            ) : (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                    background: '#f1f5f9',
                                    fontSize: '2rem'
                                }}>
                                    📄
                                </div>
                            )}
                            <div className="media-overlay">
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => copyToClipboard(item.url)}
                                        className="btn btn-sm btn-secondary"
                                    >
                                        Copy URL
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="btn btn-sm btn-danger"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                padding: '0.5rem',
                                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                                color: 'white',
                                fontSize: '0.75rem'
                            }}>
                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {item.original_name}
                                </div>
                                <div style={{ opacity: 0.7 }}>{formatSize(item.size)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
