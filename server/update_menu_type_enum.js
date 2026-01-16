const pool = require('./config/db');

const updateMenuTypeEnum = async () => {
    try {
        await pool.query(`
            ALTER TABLE menu_items 
            MODIFY COLUMN type ENUM('custom', 'page', 'category', 'homepage') DEFAULT 'custom';
        `);
        console.log("Successfully updated 'type' column to include 'homepage'.");
    } catch (error) {
        console.error('Error updating column:', error);
    } finally {
        process.exit();
    }
};

updateMenuTypeEnum();
