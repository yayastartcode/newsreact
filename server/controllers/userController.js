const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { buildArticleUrl } = require('../utils/helpers');

// Get author profile (public)
const getAuthorProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const [users] = await pool.query(
            'SELECT id, name, avatar, bio, created_at FROM users WHERE id = ?',
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'Penulis tidak ditemukan.' });
        }

        const author = users[0];

        // Get author's articles
        const [articles] = await pool.query(`
      SELECT 
        a.id, a.title, a.slug, a.excerpt, a.featured_image, a.published_at, a.view_count,
        c.name as category_name, c.slug as category_slug
      FROM articles a
      JOIN categories c ON a.category_id = c.id
      WHERE a.author_id = ? AND a.status = 'published'
      ORDER BY a.published_at DESC
      LIMIT ? OFFSET ?
    `, [id, parseInt(limit), offset]);

        const [[{ total }]] = await pool.query(
            'SELECT COUNT(*) as total FROM articles WHERE author_id = ? AND status = "published"',
            [id]
        );

        const articlesWithUrl = articles.map(article => ({
            ...article,
            url: buildArticleUrl(article.published_at, article.slug)
        }));

        res.json({
            author,
            articles: articlesWithUrl,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get author error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Get all users (admin only)
const getUsers = async (req, res) => {
    try {
        const [users] = await pool.query(`
      SELECT id, name, email, role, avatar, created_at FROM users ORDER BY created_at DESC
    `);
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Create user (admin only)
const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Nama, email, dan password diperlukan.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, role || 'author']
        );

        res.status(201).json({
            message: 'User berhasil dibuat.',
            id: result.insertId
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Email sudah terdaftar.' });
        }
        console.error('Create user error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Update user (admin only)
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, role, bio, avatar } = req.body;

        let query = 'UPDATE users SET name = ?, email = ?, role = ?, bio = ?, avatar = ?';
        const params = [name, email, role, bio, avatar];

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query += ', password = ?';
            params.push(hashedPassword);
        }

        query += ' WHERE id = ?';
        params.push(id);

        await pool.query(query, params);

        res.json({ message: 'User berhasil diupdate.' });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent deleting self
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ message: 'Tidak bisa menghapus akun sendiri.' });
        }

        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'User berhasil dihapus.' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = {
    getAuthorProfile,
    getUsers,
    createUser,
    updateUser,
    deleteUser
};
