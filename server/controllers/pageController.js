const pool = require('../config/db');
const { createSlug } = require('../utils/helpers');

// ================== PUBLIC ==================

// Get published page by slug
const getPageBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const [pages] = await pool.query(`
            SELECT p.*, u.name as author_name
            FROM pages p
            JOIN users u ON p.author_id = u.id
            WHERE p.slug = ? AND p.status = 'published'
        `, [slug]);

        if (pages.length === 0) {
            return res.status(404).json({ message: 'Halaman tidak ditemukan.' });
        }

        res.json(pages[0]);
    } catch (error) {
        console.error('Get page error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// ================== ADMIN ==================

// Get all pages
const getAllPages = async (req, res) => {
    try {
        const [pages] = await pool.query(`
            SELECT p.id, p.title, p.slug, p.status, p.created_at, p.updated_at,
                   u.name as author_name
            FROM pages p
            JOIN users u ON p.author_id = u.id
            ORDER BY p.updated_at DESC
        `);

        res.json({ pages });
    } catch (error) {
        console.error('Get all pages error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Get page by ID
const getPageById = async (req, res) => {
    try {
        const { id } = req.params;

        const [pages] = await pool.query('SELECT * FROM pages WHERE id = ?', [id]);

        if (pages.length === 0) {
            return res.status(404).json({ message: 'Halaman tidak ditemukan.' });
        }

        res.json(pages[0]);
    } catch (error) {
        console.error('Get page by id error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Create page
const createPage = async (req, res) => {
    try {
        const { title, content, excerpt, featured_image, status, meta_title, meta_description } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'Judul halaman diperlukan.' });
        }

        const slug = createSlug(title);

        const [result] = await pool.query(`
            INSERT INTO pages (title, slug, content, excerpt, featured_image, status, author_id, meta_title, meta_description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [title, slug, JSON.stringify(content || {}), excerpt, featured_image, status || 'draft', req.user.id, meta_title, meta_description]);

        res.status(201).json({
            message: 'Halaman berhasil dibuat.',
            id: result.insertId,
            slug
        });
    } catch (error) {
        console.error('Create page error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Update page
const updatePage = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, excerpt, featured_image, status, meta_title, meta_description } = req.body;

        const [existing] = await pool.query('SELECT * FROM pages WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Halaman tidak ditemukan.' });
        }

        const page = existing[0];
        const slug = title ? createSlug(title) : page.slug;

        await pool.query(`
            UPDATE pages 
            SET title = ?, slug = ?, content = ?, excerpt = ?, featured_image = ?,
                status = ?, meta_title = ?, meta_description = ?
            WHERE id = ?
        `, [
            title || page.title,
            slug,
            content ? JSON.stringify(content) : page.content,
            excerpt !== undefined ? excerpt : page.excerpt,
            featured_image !== undefined ? featured_image : page.featured_image,
            status || page.status,
            meta_title !== undefined ? meta_title : page.meta_title,
            meta_description !== undefined ? meta_description : page.meta_description,
            id
        ]);

        res.json({ message: 'Halaman berhasil diupdate.', slug });
    } catch (error) {
        console.error('Update page error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Delete page
const deletePage = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query('DELETE FROM pages WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Halaman tidak ditemukan.' });
        }

        res.json({ message: 'Halaman berhasil dihapus.' });
    } catch (error) {
        console.error('Delete page error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = {
    getPageBySlug,
    getAllPages,
    getPageById,
    createPage,
    updatePage,
    deletePage
};
