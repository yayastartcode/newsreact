const pool = require('./config/db');

const addMenuLocationColumn = async () => {
    try {
        await pool.query(`
            ALTER TABLE menu_items 
            ADD COLUMN menu_location ENUM('header', 'footer') DEFAULT 'header';
        `);
        console.log('Successfully added menu_location column to menu_items table');
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Column menu_location already exists');
        } else {
            console.error('Error adding column:', error);
        }
    } finally {
        process.exit();
    }
};

addMenuLocationColumn();
