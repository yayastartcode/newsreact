const pool = require('../config/db');
const { createSlug, buildArticleUrl } = require('../utils/helpers');

// Get all categories
const getCategories = async (req, res) => {
    try {
        const [categories] = await pool.query(`
      SELECT c.*, COUNT(a.id) as article_count
      FROM categories c
      LEFT JOIN articles a ON c.id = a.category_id AND a.status = 'published'
      GROUP BY c.id
      ORDER BY c.name
    `);
        res.json(categories);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Get articles by category
const getArticlesByCategory = async (req, res) => {
    try {
        const { slug } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const [category] = await pool.query('SELECT * FROM categories WHERE slug = ?', [slug]);
        if (category.length === 0) {
            return res.status(404).json({ message: 'Kategori tidak ditemukan.' });
        }

        const [articles] = await pool.query(`
      SELECT 
        a.id, a.title, a.slug, a.excerpt, a.featured_image, a.published_at, a.view_count,
        u.name as author_name, u.avatar as author_avatar
      FROM articles a
      JOIN users u ON a.author_id = u.id
      WHERE a.category_id = ? AND a.status = 'published'
      ORDER BY a.published_at DESC
      LIMIT ? OFFSET ?
    `, [category[0].id, parseInt(limit), offset]);

        const [[{ total }]] = await pool.query(
            'SELECT COUNT(*) as total FROM articles WHERE category_id = ? AND status = "published"',
            [category[0].id]
        );

        const articlesWithUrl = articles.map(article => ({
            ...article,
            url: buildArticleUrl(article.published_at, article.slug)
        }));

        res.json({
            category: category[0],
            articles: articlesWithUrl,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get articles by category error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Create category (admin)
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Nama kategori diperlukan.' });
        }

        const slug = createSlug(name);

        const [result] = await pool.query(
            'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)',
            [name, slug, description]
        );

        res.status(201).json({
            message: 'Kategori berhasil dibuat.',
            id: result.insertId
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Kategori sudah ada.' });
        }
        console.error('Create category error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Update category (admin)
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const slug = name ? createSlug(name) : undefined;

        await pool.query(
            'UPDATE categories SET name = COALESCE(?, name), slug = COALESCE(?, slug), description = COALESCE(?, description) WHERE id = ?',
            [name, slug, description, id]
        );

        res.json({ message: 'Kategori berhasil diupdate.' });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Delete category (admin)
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if category has articles
        const [[{ count }]] = await pool.query(
            'SELECT COUNT(*) as count FROM articles WHERE category_id = ?',
            [id]
        );

        if (count > 0) {
            return res.status(400).json({
                message: 'Tidak bisa hapus kategori yang masih memiliki artikel.'
            });
        }

        await pool.query('DELETE FROM categories WHERE id = ?', [id]);
        res.json({ message: 'Kategori berhasil dihapus.' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = {
    getCategories,
    getArticlesByCategory,
    createCategory,
    updateCategory,
    deleteCategory
};
