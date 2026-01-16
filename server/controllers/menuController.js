const pool = require('../config/db');

// Get all menu items (public)
const getMenuItems = async (req, res) => {
    try {
        const { location = 'header' } = req.query;

        const [items] = await pool.query(`
            SELECT m.*, 
                   p.title as page_title, p.slug as page_slug,
                   c.name as category_name, c.slug as category_slug
            FROM menu_items m
            LEFT JOIN pages p ON m.type = 'page' AND m.reference_id = p.id
            LEFT JOIN categories c ON m.type = 'category' AND m.reference_id = c.id
            WHERE m.menu_location = ?
            ORDER BY m.position ASC
        `, [location]);

        // Build hierarchical structure
        const buildTree = (items, parentId = null) => {
            return items
                .filter(item => item.parent_id === parentId)
                .map(item => ({
                    ...item,
                    // Generate URL based on type
                    computed_url: getComputedUrl(item),
                    children: buildTree(items, item.id)
                }));
        };

        const getComputedUrl = (item) => {
            switch (item.type) {
                case 'page':
                    return item.page_slug ? `/p/${item.page_slug}` : item.url;
                case 'category':
                    return item.category_slug ? `/kategori/${item.category_slug}` : item.url;
                default:
                    return item.url;
            }
        };

        res.json(buildTree(items));
    } catch (error) {
        console.error('Get menu items error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Get flat menu items for admin
const getAllMenuItems = async (req, res) => {
    try {
        const { location } = req.query;
        let query = `
            SELECT m.*, 
                   p.title as page_title,
                   c.name as category_name
            FROM menu_items m
            LEFT JOIN pages p ON m.type = 'page' AND m.reference_id = p.id
            LEFT JOIN categories c ON m.type = 'category' AND m.reference_id = c.id
        `;

        const params = [];
        if (location) {
            query += ' WHERE m.menu_location = ?';
            params.push(location);
        }

        query += ' ORDER BY m.position ASC';

        const [items] = await pool.query(query, params);

        res.json({ items });
    } catch (error) {
        console.error('Get all menu items error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Create menu item
const createMenuItem = async (req, res) => {
    try {
        const { title, url, type, reference_id, parent_id, target, menu_location } = req.body;
        const location = menu_location || 'header';

        if (!title) {
            return res.status(400).json({ message: 'Judul menu diperlukan.' });
        }

        // Get max position for specific location
        const [[{ maxPos }]] = await pool.query('SELECT MAX(position) as maxPos FROM menu_items WHERE menu_location = ?', [location]);
        const position = (maxPos || 0) + 1;

        // Convert empty strings to null for foreign keys
        const refId = reference_id && reference_id !== '' ? reference_id : null;
        const parId = parent_id && parent_id !== '' ? parent_id : null;

        const [result] = await pool.query(`
            INSERT INTO menu_items (title, url, type, reference_id, parent_id, position, target, menu_location)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [title, url || null, type || 'custom', refId, parId, position, target || '_self', location]);

        res.status(201).json({
            message: 'Menu item berhasil dibuat.',
            id: result.insertId
        });
    } catch (error) {
        console.error('Create menu item error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Update menu item
const updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, url, type, reference_id, parent_id, target, menu_location } = req.body;

        // Convert empty strings to null for foreign keys
        const refId = reference_id && reference_id !== '' ? reference_id : null;
        const parId = parent_id && parent_id !== '' ? parent_id : null;

        await pool.query(`
            UPDATE menu_items 
            SET title = ?, url = ?, type = ?, reference_id = ?, parent_id = ?, target = ?, menu_location = ?
            WHERE id = ?
        `, [title, url || null, type, refId, parId, target, menu_location, id]);

        res.json({ message: 'Menu item berhasil diupdate.' });
    } catch (error) {
        console.error('Update menu item error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Reorder menu items
const reorderMenuItems = async (req, res) => {
    try {
        const { items } = req.body; // Array of { id, position, parent_id }

        if (!items || !Array.isArray(items)) {
            return res.status(400).json({ message: 'Invalid data.' });
        }

        // Update positions in transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            for (const item of items) {
                await connection.query(
                    'UPDATE menu_items SET position = ?, parent_id = ? WHERE id = ?',
                    [item.position, item.parent_id || null, item.id]
                );
            }
            await connection.commit();
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

        res.json({ message: 'Menu berhasil diurutkan.' });
    } catch (error) {
        console.error('Reorder menu items error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Delete menu item
const deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query('DELETE FROM menu_items WHERE id = ?', [id]);

        res.json({ message: 'Menu item berhasil dihapus.' });
    } catch (error) {
        console.error('Delete menu item error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = {
    getMenuItems,
    getAllMenuItems,
    createMenuItem,
    updateMenuItem,
    reorderMenuItems,
    deleteMenuItem
};
