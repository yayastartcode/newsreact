const pool = require('../config/db');
const viewService = require('../services/viewService');

// Sync views from Redis to MySQL periodically
const syncViewsToDatabase = async () => {
    try {
        const keys = await viewService.getAllPendingViewKeys();

        if (keys.length === 0) return;

        console.log(`📊 Syncing ${keys.length} article views to database...`);

        for (const key of keys) {
            const articleId = key.replace('views:article:', '');
            const count = await viewService.getAndClearViews(articleId);

            if (count > 0) {
                await pool.query(
                    'UPDATE articles SET view_count = view_count + ? WHERE id = ?',
                    [count, articleId]
                );
            }
        }

        console.log(`✅ Views synced successfully`);
    } catch (error) {
        console.error('View sync error:', error);
    }
};

// Start periodic sync
const startViewSync = () => {
    const interval = parseInt(process.env.VIEW_SYNC_INTERVAL) || 300000; // Default 5 minutes

    console.log(`📊 View sync started (every ${interval / 1000} seconds)`);

    // Sync on startup (after 30 seconds)
    setTimeout(syncViewsToDatabase, 30000);

    // Then sync periodically
    setInterval(syncViewsToDatabase, interval);
};

// Sync before server shutdown
const syncBeforeExit = async () => {
    console.log('📊 Syncing views before shutdown...');
    await syncViewsToDatabase();
};

module.exports = { startViewSync, syncViewsToDatabase, syncBeforeExit };
