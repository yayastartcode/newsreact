import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import EditorJS from '@editorjs/editorjs'
import Header from '@editorjs/header'
import List from '@editorjs/list'
import Quote from '@editorjs/quote'
import Embed from '@editorjs/embed'
import api from '../services/api'

export default function ArticleEditor() {
    const { id } = useParams()
    const navigate = useNavigate()
    const editorRef = useRef(null)
    const editorInstance = useRef(null)
    const [editorReady, setEditorReady] = useState(false)

    const [loading, setLoading] = useState(!!id)
    const [saving, setSaving] = useState(false)
    const [categories, setCategories] = useState([])
    const [initialContent, setInitialContent] = useState(null)

    // Tag input state
    const [tagInput, setTagInput] = useState('')
    const [tagSuggestions, setTagSuggestions] = useState([])
    const [selectedTags, setSelectedTags] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)

    const [form, setForm] = useState({
        title: '',
        excerpt: '',
        category_id: '',
        featured_image: '',
        status: 'draft'
    })

    useEffect(() => {
        fetchCategories()
        if (id) {
            fetchArticle()
        } else {
            setLoading(false)
        }
    }, [id])

    // Initialize editor after loading is complete
    useEffect(() => {
        if (!loading && editorRef.current && !editorInstance.current) {
            initEditor(initialContent)
        }

        return () => {
            if (editorInstance.current && typeof editorInstance.current.destroy === 'function') {
                try {
                    editorInstance.current.destroy()
                } catch (e) {
                    console.error('Editor cleanup error', e)
                }
                editorInstance.current = null
            }
        }
    }, [loading]) // Removed initialContent from dependency to prevent re-init

    // Search tags when input changes
    useEffect(() => {
        const searchTags = async () => {
            if (tagInput.length < 1) {
                setTagSuggestions([])
                return
            }
            try {
                const { data } = await api.get(`/admin/tags/search?q=${encodeURIComponent(tagInput)}`)
                // Filter out already selected tags
                const filtered = data.filter(t => !selectedTags.some(st => st.name.toLowerCase() === t.name.toLowerCase()))
                setTagSuggestions(filtered)
            } catch (error) {
                console.error('Tag search error:', error)
            }
        }

        const debounce = setTimeout(searchTags, 200)
        return () => clearTimeout(debounce)
    }, [tagInput, selectedTags])

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories')
            setCategories(data)
        } catch (error) {
            console.error('Failed to fetch categories:', error)
        }
    }

    const fetchArticle = async () => {
        try {
            const { data } = await api.get(`/admin/articles/${id}`)
            setForm({
                title: data.title,
                excerpt: data.excerpt || '',
                category_id: data.category_id,
                featured_image: data.featured_image || '',
                status: data.status
            })
            // Set existing tags
            if (data.tags && data.tags.length > 0) {
                setSelectedTags(data.tags.map(t => ({ id: t.id, name: t.name })))
            }
            const content = typeof data.content === 'string' ? JSON.parse(data.content) : data.content
            setInitialContent(content)
        } catch (error) {
            console.error('Failed to fetch article:', error)
            navigate('/articles')
        } finally {
            setLoading(false)
        }
    }

    const initEditor = (data = null) => {
        if (editorInstance.current || !editorRef.current) return

        // Clear previous content if any (important for fixing double render)
        editorRef.current.innerHTML = ''

        editorInstance.current = new EditorJS({
            holder: editorRef.current,
            placeholder: 'Mulai menulis artikel...',
            tools: {
                header: {
                    class: Header,
                    config: {
                        levels: [2, 3, 4],
                        defaultLevel: 2
                    }
                },
                list: {
                    class: List,
                    inlineToolbar: true
                },
                quote: {
                    class: Quote,
                    inlineToolbar: true
                },
                embed: Embed
            },
            data: data || { blocks: [] },
            onReady: () => {
                setEditorReady(true)
            }
        })
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm({ ...form, [name]: value })
    }

    // Tag handlers
    const handleTagInputChange = (e) => {
        setTagInput(e.target.value)
        setShowSuggestions(true)
    }

    const handleTagInputKeyDown = (e) => {
        if (e.key === ',' || e.key === 'Enter') {
            e.preventDefault()
            addTagFromInput()
        } else if (e.key === 'Backspace' && tagInput === '' && selectedTags.length > 0) {
            // Remove last tag when backspace on empty input
            setSelectedTags(selectedTags.slice(0, -1))
        }
    }

    const addTagFromInput = () => {
        const trimmed = tagInput.trim().replace(/,/g, '')
        if (trimmed && !selectedTags.some(t => t.name.toLowerCase() === trimmed.toLowerCase())) {
            setSelectedTags([...selectedTags, { id: null, name: trimmed }])
        }
        setTagInput('')
        setShowSuggestions(false)
    }

    const selectSuggestion = (tag) => {
        if (!selectedTags.some(t => t.name.toLowerCase() === tag.name.toLowerCase())) {
            setSelectedTags([...selectedTags, tag])
        }
        setTagInput('')
        setShowSuggestions(false)
    }

    const removeTag = (index) => {
        setSelectedTags(selectedTags.filter((_, i) => i !== index))
    }

    const handleSubmit = async (status) => {
        if (!form.title || !form.category_id) {
            alert('Judul dan kategori wajib diisi')
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

            // Send tag names (not IDs) - backend will handle create/find
            const tagNames = selectedTags.map(t => t.name)

            const payload = {
                ...form,
                tags: tagNames,
                content,
                status
            }

            if (id) {
                await api.put(`/admin/articles/${id}`, payload)
            } else {
                await api.post('/admin/articles', payload)
            }

            navigate('/articles')
        } catch (error) {
            console.error('Failed to save article:', error)
            alert('Gagal menyimpan artikel')
        } finally {
            setSaving(false)
        }
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        const formData = new FormData()
        formData.append('file', file)

        try {
            const { data } = await api.post('/admin/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            setForm({ ...form, featured_image: data.url })
        } catch (error) {
            alert('Gagal upload gambar')
        }
    }

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">{id ? 'Edit Artikel' : 'Artikel Baru'}</h1>
                <div className="flex gap-1">
                    <button
                        onClick={() => handleSubmit('draft')}
                        className="btn btn-secondary"
                        disabled={saving}
                    >
                        Simpan Draft
                    </button>
                    <button
                        onClick={() => handleSubmit('published')}
                        className="btn btn-primary"
                        disabled={saving}
                    >
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
                            placeholder="Judul Artikel"
                            value={form.title}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Konten</label>
                        <div className="editor-container" ref={editorRef}></div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Excerpt</label>
                        <textarea
                            name="excerpt"
                            className="form-textarea"
                            placeholder="Ringkasan artikel (opsional)"
                            value={form.excerpt}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div>
                    <div className="card mb-2">
                        <div className="card-header">Kategori</div>
                        <div className="card-body">
                            <select
                                name="category_id"
                                className="form-select"
                                value={form.category_id}
                                onChange={handleChange}
                            >
                                <option value="">Pilih Kategori</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="card mb-2">
                        <div className="card-header">Tags</div>
                        <div className="card-body">
                            {/* Selected tags */}
                            <div className="tag-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                {selectedTags.map((tag, index) => (
                                    <span key={index} className="tag-badge" style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        padding: '0.25rem 0.5rem',
                                        background: 'var(--color-primary)',
                                        color: 'white',
                                        borderRadius: '0.25rem',
                                        fontSize: '0.875rem'
                                    }}>
                                        {tag.name}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(index)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: 'white',
                                                cursor: 'pointer',
                                                padding: 0,
                                                fontSize: '1rem',
                                                lineHeight: 1
                                            }}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>

                            {/* Tag input */}
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Ketik tag, pisahkan dengan koma..."
                                    value={tagInput}
                                    onChange={handleTagInputChange}
                                    onKeyDown={handleTagInputKeyDown}
                                    onFocus={() => setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                />

                                {/* Suggestions dropdown */}
                                {showSuggestions && tagSuggestions.length > 0 && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        background: 'white',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '0.25rem',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                        zIndex: 10,
                                        maxHeight: '200px',
                                        overflowY: 'auto'
                                    }}>
                                        {tagSuggestions.map((tag) => (
                                            <div
                                                key={tag.id}
                                                onClick={() => selectSuggestion(tag)}
                                                style={{
                                                    padding: '0.5rem 0.75rem',
                                                    cursor: 'pointer',
                                                    borderBottom: '1px solid var(--color-border)'
                                                }}
                                                onMouseOver={(e) => e.target.style.background = 'var(--color-bg-alt)'}
                                                onMouseOut={(e) => e.target.style.background = 'white'}
                                            >
                                                {tag.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <small style={{ color: 'var(--color-text-light)', display: 'block', marginTop: '0.5rem' }}>
                                Tekan Enter atau koma untuk menambah tag baru
                            </small>
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
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ fontSize: '0.875rem' }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
