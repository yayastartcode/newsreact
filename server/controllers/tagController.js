const pool = require('../config/db');
const { createSlug, buildArticleUrl } = require('../utils/helpers');

// Get all tags
const getTags = async (req, res) => {
    try {
        const [tags] = await pool.query(`
      SELECT t.*, COUNT(at.article_id) as article_count
      FROM tags t
      LEFT JOIN article_tags at ON t.id = at.tag_id
      LEFT JOIN articles a ON at.article_id = a.id AND a.status = 'published'
      GROUP BY t.id
      ORDER BY t.name
    `);
        res.json(tags);
    } catch (error) {
        console.error('Get tags error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Search tags for autocomplete
const searchTags = async (req, res) => {
    try {
        const { q = '', limit = 10 } = req.query;

        const [tags] = await pool.query(
            'SELECT id, name, slug FROM tags WHERE name LIKE ? ORDER BY name ASC LIMIT ?',
            [`%${q}%`, parseInt(limit)]
        );

        res.json(tags);
    } catch (error) {
        console.error('Search tags error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Get articles by tag
const getArticlesByTag = async (req, res) => {
    try {
        const { slug } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const [tag] = await pool.query('SELECT * FROM tags WHERE slug = ?', [slug]);
        if (tag.length === 0) {
            return res.status(404).json({ message: 'Tag tidak ditemukan.' });
        }

        const [articles] = await pool.query(`
      SELECT 
        a.id, a.title, a.slug, a.excerpt, a.featured_image, a.published_at, a.view_count,
        u.name as author_name,
        c.name as category_name, c.slug as category_slug
      FROM articles a
      JOIN users u ON a.author_id = u.id
      JOIN categories c ON a.category_id = c.id
      JOIN article_tags at ON a.id = at.article_id
      WHERE at.tag_id = ? AND a.status = 'published'
      ORDER BY a.published_at DESC
      LIMIT ? OFFSET ?
    `, [tag[0].id, parseInt(limit), offset]);

        const [[{ total }]] = await pool.query(`
      SELECT COUNT(*) as total FROM articles a
      JOIN article_tags at ON a.id = at.article_id
      WHERE at.tag_id = ? AND a.status = 'published'
    `, [tag[0].id]);

        const articlesWithUrl = articles.map(article => ({
            ...article,
            url: buildArticleUrl(article.published_at, article.slug)
        }));

        res.json({
            tag: tag[0],
            articles: articlesWithUrl,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get articles by tag error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Create tag (admin)
const createTag = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Nama tag diperlukan.' });
        }

        const slug = createSlug(name);

        const [result] = await pool.query(
            'INSERT INTO tags (name, slug) VALUES (?, ?)',
            [name, slug]
        );

        res.status(201).json({
            message: 'Tag berhasil dibuat.',
            id: result.insertId
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Tag sudah ada.' });
        }
        console.error('Create tag error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Update tag (admin)
const updateTag = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const slug = createSlug(name);

        await pool.query(
            'UPDATE tags SET name = ?, slug = ? WHERE id = ?',
            [name, slug, id]
        );

        res.json({ message: 'Tag berhasil diupdate.' });
    } catch (error) {
        console.error('Update tag error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Delete tag (admin)
const deleteTag = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM tags WHERE id = ?', [id]);
        res.json({ message: 'Tag berhasil dihapus.' });
    } catch (error) {
        console.error('Delete tag error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = {
    getTags,
    searchTags,
    getArticlesByTag,
    createTag,
    updateTag,
    deleteTag
};
