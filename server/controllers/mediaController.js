const pool = require('../config/db');
const path = require('path');
const fs = require('fs');

// Upload media
const uploadMedia = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'File tidak ditemukan.' });
        }

        const { filename, originalname, size, mimetype, path: filePath } = req.file;

        // Get relative path from uploads folder
        const uploadsDir = path.join(__dirname, '../uploads');
        const relativePath = filePath.replace(uploadsDir, '').replace(/\\/g, '/');

        const [result] = await pool.query(`
      INSERT INTO media (filename, original_name, path, size, mime_type, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [filename, originalname, relativePath, size, mimetype, req.user.id]);

        res.status(201).json({
            message: 'File berhasil diupload.',
            id: result.insertId,
            url: `/uploads${relativePath}`,
            filename,
            original_name: originalname,
            size,
            mime_type: mimetype
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Get all media
const getMedia = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const [media] = await pool.query(`
      SELECT m.*, u.name as uploader_name
      FROM media m
      JOIN users u ON m.uploaded_by = u.id
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), offset]);

        const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM media');

        const mediaWithUrl = media.map(item => ({
            ...item,
            url: `/uploads${item.path}`
        }));

        res.json({
            media: mediaWithUrl,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get media error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Delete media
const deleteMedia = async (req, res) => {
    try {
        const { id } = req.params;

        const [media] = await pool.query('SELECT * FROM media WHERE id = ?', [id]);

        if (media.length === 0) {
            return res.status(404).json({ message: 'Media tidak ditemukan.' });
        }

        // Delete file from disk
        const filePath = path.join(__dirname, '../uploads', media[0].path);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await pool.query('DELETE FROM media WHERE id = ?', [id]);

        res.json({ message: 'Media berhasil dihapus.' });
    } catch (error) {
        console.error('Delete media error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = {
    uploadMedia,
    getMedia,
    deleteMedia
};
