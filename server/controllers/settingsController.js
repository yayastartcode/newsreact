const pool = require('../config/db');

// Get all settings (public - filtered)
const getPublicSettings = async (req, res) => {
    try {
        const [settings] = await pool.query(`
            SELECT setting_key, setting_value, setting_type
            FROM settings
            WHERE setting_key IN ('site_name', 'site_description', 'logo', 'logo_dark', 'favicon', 
                                  'footer_text', 'social_facebook', 'social_twitter', 
                                  'social_instagram', 'social_youtube', 'trending_category',
                                  'category_column_1', 'category_column_2', 'category_column_3',
                                  'posts_per_page')
        `);

        // Convert to object
        const settingsObj = {};
        settings.forEach(s => {
            settingsObj[s.setting_key] = s.setting_value;
        });

        res.json(settingsObj);
    } catch (error) {
        console.error('Get public settings error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Get all settings (admin)
const getAllSettings = async (req, res) => {
    try {
        const [settings] = await pool.query('SELECT * FROM settings ORDER BY setting_key');

        res.json({ settings });
    } catch (error) {
        console.error('Get all settings error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Update single setting
const updateSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;

        await pool.query(
            'UPDATE settings SET setting_value = ? WHERE setting_key = ?',
            [value, key]
        );

        res.json({ message: 'Setting berhasil diupdate.' });
    } catch (error) {
        console.error('Update setting error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Update multiple settings at once
const updateSettings = async (req, res) => {
    try {
        const { settings } = req.body; // Object of key-value pairs

        if (!settings || typeof settings !== 'object') {
            return res.status(400).json({ message: 'Invalid data.' });
        }

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            for (const [key, value] of Object.entries(settings)) {
                // Normalize URLs for logo/favicon/image settings
                let normalizedValue = value;
                if (typeof value === 'string' && (key.includes('logo') || key.includes('favicon') || key.includes('image'))) {
                    // Strip protocol and domain if present, keep only path
                    normalizedValue = value.replace(/^https?:\/\/[^\/]+/, '');
                }

                await connection.query(
                    `INSERT INTO settings (setting_key, setting_value) 
                     VALUES (?, ?) 
                     ON DUPLICATE KEY UPDATE setting_value = ?`,
                    [key, normalizedValue, normalizedValue]
                );
            }
            await connection.commit();
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

        res.json({ message: 'Settings berhasil diupdate.' });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Upload logo
const uploadLogo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'File tidak ditemukan.' });
        }

        // Get year/month from file path (uploads are organized by year/month)
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const logoUrl = `/uploads/${year}/${month}/${req.file.filename}`;

        const logoType = req.body.type || 'logo'; // 'logo', 'logo_dark', or 'favicon'

        await pool.query(
            'UPDATE settings SET setting_value = ? WHERE setting_key = ?',
            [logoUrl, logoType]
        );

        res.json({
            message: 'Logo berhasil diupload.',
            url: logoUrl
        });
    } catch (error) {
        console.error('Upload logo error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = {
    getPublicSettings,
    getAllSettings,
    updateSetting,
    updateSettings,
    uploadLogo
};
