import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import EditorJS from '@editorjs/editorjs'
import Header from '@editorjs/header'
import List from '@editorjs/list'
import Quote from '@editorjs/quote'
import api from '../services/api'

export default function PageEditor() {
    const { id } = useParams()
    const navigate = useNavigate()
    const editorRef = useRef(null)
    const editorInstance = useRef(null)

    const [loading, setLoading] = useState(!!id)
    const [saving, setSaving] = useState(false)
    const [initialContent, setInitialContent] = useState(null)

    const [form, setForm] = useState({
        title: '',
        excerpt: '',
        featured_image: '',
        meta_title: '',
        meta_description: '',
        status: 'draft'
    })

    useEffect(() => {
        if (id) {
            fetchPage()
        } else {
            setLoading(false)
        }
    }, [id])

    useEffect(() => {
        let isMounted = true

        const setupEditor = async () => {
            // Wait a tick for DOM to be ready
            await new Promise(resolve => setTimeout(resolve, 100))

            if (!isMounted) return
            if (!loading && editorRef.current && !editorInstance.current) {
                // Clear any existing editor content in the container
                if (editorRef.current.querySelector('.codex-editor')) {
                    editorRef.current.innerHTML = ''
                }
                initEditor(initialContent)
            }
        }

        setupEditor()

        return () => {
            isMounted = false
            if (editorInstance.current) {
                try {
                    editorInstance.current.destroy()
                } catch (e) { }
                editorInstance.current = null
            }
            // Clear the container on unmount
            if (editorRef.current) {
                editorRef.current.innerHTML = ''
            }
        }
    }, [loading, initialContent])

    const fetchPage = async () => {
        try {
            const { data } = await api.get(`/admin/pages/${id}`)
            setForm({
                title: data.title,
                excerpt: data.excerpt || '',
                featured_image: data.featured_image || '',
                meta_title: data.meta_title || '',
                meta_description: data.meta_description || '',
                status: data.status
            })
            const content = typeof data.content === 'string' ? JSON.parse(data.content) : data.content
            setInitialContent(content)
        } catch (error) {
            console.error('Failed to fetch page:', error)
            navigate('/pages')
        } finally {
            setLoading(false)
        }
    }

    const initEditor = (data = null) => {
        if (editorInstance.current || !editorRef.current) return

        // Double check no existing editor
        if (editorRef.current.querySelector('.codex-editor')) {
            editorRef.current.innerHTML = ''
        }

        editorInstance.current = new EditorJS({
            holder: editorRef.current,
            placeholder: 'Mulai menulis konten halaman...',
            tools: {
                header: {
                    class: Header,
                    config: { levels: [2, 3, 4], defaultLevel: 2 }
                },
                list: { class: List, inlineToolbar: true },
                quote: { class: Quote, inlineToolbar: true }
            },
            data: data || { blocks: [] },
            onReady: () => {
                console.log('Editor.js ready')
            }
        })
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm({ ...form, [name]: value })
    }

    const handleSubmit = async (status) => {
        if (!form.title) {
            alert('Judul halaman wajib diisi')
            return
        }

        if (!editorInstance.current) {
            alert('Editor belum siap, coba lagi')
            return
        }

        setSaving(true)

        try {
            // Wait for editor to be ready then save
            await editorInstance.current.isReady
            const content = await editorInstance.current.save()

            const payload = { ...form, content, status }

            if (id) {
                await api.put(`/admin/pages/${id}`, payload)
            } else {
                await api.post('/admin/pages', payload)
            }

            navigate('/pages')
        } catch (error) {
            console.error('Failed to save page:', error)
            alert('Gagal menyimpan halaman')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">{id ? 'Edit Halaman' : 'Halaman Baru'}</h1>
                <div className="flex gap-1">
                    <button onClick={() => handleSubmit('draft')} className="btn btn-secondary" disabled={saving}>
                        Simpan Draft
                    </button>
                    <button onClick={() => handleSubmit('published')} className="btn btn-primary" disabled={saving}>
                        {saving ? 'Menyimpan...' : 'Publish'}
                    </button>
                </div>
            </div>

            <div className="grid-3" style={{ gridTemplateColumns: '1fr 320px' }}>
                <div>
                    <div className="form-group">
                        <input
                            type="text"
                            name="title"
                            className="form-input"
                            style={{ fontSize: '1.5rem', fontWeight: 600, padding: '1rem' }}
                            placeholder="Judul Halaman"
                            value={form.title}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Konten</label>
                        <div className="editor-container" ref={editorRef}></div>
                    </div>
                </div>

                <div>
                    <div className="card mb-2">
                        <div className="card-header">SEO</div>
                        <div className="card-body">
                            <div className="form-group">
                                <label className="form-label">Meta Title</label>
                                <input
                                    type="text"
                                    name="meta_title"
                                    className="form-input"
                                    placeholder="Meta title (opsional)"
                                    value={form.meta_title}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Meta Description</label>
                                <textarea
                                    name="meta_description"
                                    className="form-textarea"
                                    placeholder="Meta description (opsional)"
                                    value={form.meta_description}
                                    onChange={handleChange}
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">Featured Image</div>
                        <div className="card-body">
                            {form.featured_image && (
                                <img
                                    src={form.featured_image}
                                    alt="Featured"
                                    style={{ width: '100%', borderRadius: '0.5rem', marginBottom: '1rem' }}
                                />
                            )}
                            <input
                                type="text"
                                name="featured_image"
                                className="form-input"
                                placeholder="URL gambar"
                                value={form.featured_image}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
