const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email dan password diperlukan.' });
        }

        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(401).json({ message: 'Email atau password salah.' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Email atau password salah.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

const getProfile = async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT id, name, email, role, avatar, bio, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User tidak ditemukan.' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, bio, avatar } = req.body;

        await pool.query(
            'UPDATE users SET name = ?, bio = ?, avatar = ? WHERE id = ?',
            [name, bio, avatar, req.user.id]
        );

        res.json({ message: 'Profile berhasil diupdate.' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = { login, getProfile, updateProfile };
