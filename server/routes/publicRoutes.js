const express = require('express');
const router = express.Router();

const articleController = require('../controllers/articleController');
const categoryController = require('../controllers/categoryController');
const tagController = require('../controllers/tagController');
const userController = require('../controllers/userController');
const adController = require('../controllers/adController');
const pageController = require('../controllers/pageController');
const menuController = require('../controllers/menuController');
const settingsController = require('../controllers/settingsController');

// Articles
router.get('/articles', articleController.getArticles);
router.get('/articles/featured', articleController.getFeaturedArticles);
router.get('/articles/trending', articleController.getTrendingArticles);
router.get('/articles/:year/:month/:day/:slug', articleController.getArticleBySlug);
router.get('/articles/:year/:month/:day/:slug/related', articleController.getRelatedArticles);
router.get('/search', articleController.searchArticles);

// Archives
router.get('/archives/:year/:month?', articleController.getArchives);

// Categories
router.get('/categories', categoryController.getCategories);
router.get('/categories/:slug/articles', categoryController.getArticlesByCategory);

// Tags
router.get('/tags', tagController.getTags);
router.get('/tags/:slug/articles', tagController.getArticlesByTag);

// Authors
router.get('/authors/:id', userController.getAuthorProfile);

// Ads
router.get('/ads', adController.getAds);

// Pages
router.get('/pages/:slug', pageController.getPageBySlug);

// Menu
router.get('/menu', menuController.getMenuItems);

// Settings
router.get('/settings', settingsController.getPublicSettings);

module.exports = router;
