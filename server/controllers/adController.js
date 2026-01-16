const pool = require('../config/db');

// Get active ads by position (public)
const getAds = async (req, res) => {
    try {
        const { position } = req.query;

        let query = 'SELECT id, name, position, code FROM ad_placements WHERE is_active = TRUE';
        const params = [];

        if (position) {
            query += ' AND position = ?';
            params.push(position);
        }

        const [ads] = await pool.query(query, params);
        res.json(ads);
    } catch (error) {
        console.error('Get ads error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Get all ads (admin)
const getAllAds = async (req, res) => {
    try {
        const [ads] = await pool.query('SELECT * FROM ad_placements ORDER BY position');
        res.json(ads);
    } catch (error) {
        console.error('Get all ads error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Create ad (admin)
const createAd = async (req, res) => {
    try {
        const { name, position, code, is_active = true } = req.body;

        if (!name || !position || !code) {
            return res.status(400).json({ message: 'Nama, posisi, dan kode iklan diperlukan.' });
        }

        const [result] = await pool.query(
            'INSERT INTO ad_placements (name, position, code, is_active) VALUES (?, ?, ?, ?)',
            [name, position, code, is_active]
        );

        res.status(201).json({
            message: 'Iklan berhasil dibuat.',
            id: result.insertId
        });
    } catch (error) {
        console.error('Create ad error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Update ad (admin)
const updateAd = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, position, code, is_active } = req.body;

        await pool.query(
            'UPDATE ad_placements SET name = ?, position = ?, code = ?, is_active = ? WHERE id = ?',
            [name, position, code, is_active, id]
        );

        res.json({ message: 'Iklan berhasil diupdate.' });
    } catch (error) {
        console.error('Update ad error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Delete ad (admin)
const deleteAd = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM ad_placements WHERE id = ?', [id]);
        res.json({ message: 'Iklan berhasil dihapus.' });
    } catch (error) {
        console.error('Delete ad error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = {
    getAds,
    getAllAds,
    createAd,
    updateAd,
    deleteAd
};
