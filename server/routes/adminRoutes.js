const express = require('express');
const router = express.Router();

const { auth, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

const authController = require('../controllers/authController');
const articleController = require('../controllers/articleController');
const categoryController = require('../controllers/categoryController');
const tagController = require('../controllers/tagController');
const mediaController = require('../controllers/mediaController');
const userController = require('../controllers/userController');
const adController = require('../controllers/adController');
const pageController = require('../controllers/pageController');
const menuController = require('../controllers/menuController');
const settingsController = require('../controllers/settingsController');

// Auth
router.post('/auth/login', authController.login);
router.get('/auth/profile', auth, authController.getProfile);
router.put('/auth/profile', auth, authController.updateProfile);

// Articles (protected)
router.get('/admin/articles', auth, articleController.getAllArticles);
router.get('/admin/articles/:id', auth, articleController.getArticleById);
router.post('/admin/articles', auth, articleController.createArticle);
router.put('/admin/articles/:id', auth, articleController.updateArticle);
router.delete('/admin/articles/:id', auth, articleController.deleteArticle);
router.patch('/admin/articles/:id/featured', auth, articleController.toggleFeatured);

// Media (protected)
router.get('/admin/media', auth, mediaController.getMedia);
router.post('/admin/upload', auth, upload.single('file'), mediaController.uploadMedia);
router.delete('/admin/media/:id', auth, mediaController.deleteMedia);

// Categories (admin only)
router.get('/admin/categories', auth, categoryController.getCategories);
router.post('/admin/categories', auth, adminOnly, categoryController.createCategory);
router.put('/admin/categories/:id', auth, adminOnly, categoryController.updateCategory);
router.delete('/admin/categories/:id', auth, adminOnly, categoryController.deleteCategory);

// Tags (admin only for CUD, search for all authenticated)
router.get('/admin/tags/search', auth, tagController.searchTags);
router.post('/admin/tags', auth, adminOnly, tagController.createTag);
router.put('/admin/tags/:id', auth, adminOnly, tagController.updateTag);
router.delete('/admin/tags/:id', auth, adminOnly, tagController.deleteTag);

// Users (admin only)
router.get('/admin/users', auth, adminOnly, userController.getUsers);
router.post('/admin/users', auth, adminOnly, userController.createUser);
router.put('/admin/users/:id', auth, adminOnly, userController.updateUser);
router.delete('/admin/users/:id', auth, adminOnly, userController.deleteUser);

// Ads (admin only)
router.get('/admin/ads', auth, adminOnly, adController.getAllAds);
router.post('/admin/ads', auth, adminOnly, adController.createAd);
router.put('/admin/ads/:id', auth, adminOnly, adController.updateAd);
router.delete('/admin/ads/:id', auth, adminOnly, adController.deleteAd);

// Pages (admin only)
router.get('/admin/pages', auth, adminOnly, pageController.getAllPages);
router.get('/admin/pages/:id', auth, adminOnly, pageController.getPageById);
router.post('/admin/pages', auth, adminOnly, pageController.createPage);
router.put('/admin/pages/:id', auth, adminOnly, pageController.updatePage);
router.delete('/admin/pages/:id', auth, adminOnly, pageController.deletePage);

// Menu (admin only)
router.get('/admin/menu', auth, adminOnly, menuController.getAllMenuItems);
router.post('/admin/menu', auth, adminOnly, menuController.createMenuItem);
router.put('/admin/menu/reorder', auth, adminOnly, menuController.reorderMenuItems);
router.put('/admin/menu/:id', auth, adminOnly, menuController.updateMenuItem);
router.delete('/admin/menu/:id', auth, adminOnly, menuController.deleteMenuItem);

// Settings (admin only)
router.get('/admin/settings', auth, adminOnly, settingsController.getAllSettings);
router.put('/admin/settings', auth, adminOnly, settingsController.updateSettings);
router.put('/admin/settings/:key', auth, adminOnly, settingsController.updateSetting);
router.post('/admin/settings/logo', auth, adminOnly, upload.single('file'), settingsController.uploadLogo);

// Demo Data (admin only)
const demoDataService = require('../services/demoDataService');

router.get('/admin/demo/stats', auth, adminOnly, async (req, res) => {
    try {
        const stats = await demoDataService.getDemoStats();
        res.json(stats);
    } catch (error) {
        console.error('Get demo stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/admin/demo/seed', auth, adminOnly, async (req, res) => {
    try {
        const result = await demoDataService.seedDemoData();
        res.json(result);
    } catch (error) {
        console.error('Seed demo data error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/admin/demo', auth, adminOnly, async (req, res) => {
    try {
        const result = await demoDataService.deleteDemoData();
        res.json(result);
    } catch (error) {
        console.error('Delete demo data error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
