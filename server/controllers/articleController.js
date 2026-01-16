const pool = require('../config/db');
const { createSlug, buildArticleUrl, paginate } = require('../utils/helpers');
const viewService = require('../services/viewService');
const { processTagNames, linkTagsToArticle } = require('../services/tagService');

// ================== PUBLIC ==================

const getArticles = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, tag } = req.query;
        const { limit: limitNum, offset } = paginate(page, limit);

        let query = `
      SELECT 
        a.id, a.title, a.slug, a.excerpt, a.featured_image, 
        a.published_at, a.view_count,
        u.id as author_id, u.name as author_name, u.avatar as author_avatar,
        c.id as category_id, c.name as category_name, c.slug as category_slug
      FROM articles a
      JOIN users u ON a.author_id = u.id
      JOIN categories c ON a.category_id = c.id
      WHERE a.status = 'published'
    `;
        const params = [];

        if (category) {
            query += ' AND c.slug = ?';
            params.push(category);
        }

        query += ' ORDER BY a.published_at DESC LIMIT ? OFFSET ?';
        params.push(limitNum, offset);

        const [articles] = await pool.query(query, params);

        // Get total count
        let countQuery = `
      SELECT COUNT(*) as total FROM articles a
      JOIN categories c ON a.category_id = c.id
      WHERE a.status = 'published'
    `;
        const countParams = [];
        if (category) {
            countQuery += ' AND c.slug = ?';
            countParams.push(category);
        }
        const [[{ total }]] = await pool.query(countQuery, countParams);

        // Add URL to each article
        const articlesWithUrl = articles.map(article => ({
            ...article,
            url: buildArticleUrl(article.published_at, article.slug)
        }));

        res.json({
            articles: articlesWithUrl,
            pagination: {
                page: parseInt(page),
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Get articles error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

const getFeaturedArticles = async (req, res) => {
    try {
        const { limit = 5 } = req.query;

        const [articles] = await pool.query(`
            SELECT 
                a.id, a.title, a.slug, a.excerpt, a.featured_image, 
                a.published_at, a.view_count,
                u.id as author_id, u.name as author_name, u.avatar as author_avatar,
                c.id as category_id, c.name as category_name, c.slug as category_slug
            FROM articles a
            JOIN users u ON a.author_id = u.id
            JOIN categories c ON a.category_id = c.id
            WHERE a.status = 'published' AND a.is_featured = 1
            ORDER BY a.published_at DESC
            LIMIT ?
        `, [parseInt(limit)]);

        const articlesWithUrl = articles.map(article => ({
            ...article,
            url: buildArticleUrl(article.published_at, article.slug)
        }));

        res.json(articlesWithUrl);
    } catch (error) {
        console.error('Get featured articles error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

const getTrendingArticles = async (req, res) => {
    try {
        const { limit = 5 } = req.query;

        const [articles] = await pool.query(`
            SELECT 
                a.id, a.title, a.slug, a.excerpt, a.featured_image, 
                a.published_at, a.view_count,
                u.id as author_id, u.name as author_name, u.avatar as author_avatar,
                c.id as category_id, c.name as category_name, c.slug as category_slug
            FROM articles a
            JOIN users u ON a.author_id = u.id
            JOIN categories c ON a.category_id = c.id
            WHERE a.status = 'published'
            ORDER BY a.view_count DESC
            LIMIT ?
        `, [parseInt(limit)]);

        const articlesWithUrl = articles.map(article => ({
            ...article,
            url: buildArticleUrl(article.published_at, article.slug)
        }));

        res.json(articlesWithUrl);
    } catch (error) {
        console.error('Get trending articles error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

const getArticleBySlug = async (req, res) => {
    try {
        const { year, month, day, slug } = req.params;

        const [articles] = await pool.query(`
      SELECT 
        a.*,
        u.id as author_id, u.name as author_name, u.avatar as author_avatar, u.bio as author_bio,
        c.id as category_id, c.name as category_name, c.slug as category_slug
      FROM articles a
      JOIN users u ON a.author_id = u.id
      JOIN categories c ON a.category_id = c.id
      WHERE a.slug = ? 
        AND a.status = 'published'
        AND YEAR(a.published_at) = ?
        AND MONTH(a.published_at) = ?
        AND DAY(a.published_at) = ?
    `, [slug, year, month, day]);

        if (articles.length === 0) {
            return res.status(404).json({ message: 'Artikel tidak ditemukan.' });
        }

        const article = articles[0];

        // Get tags
        const [tags] = await pool.query(`
      SELECT t.id, t.name, t.slug
      FROM tags t
      JOIN article_tags at ON t.id = at.tag_id
      WHERE at.article_id = ?
    `, [article.id]);

        // Increment view count via Redis (non-blocking)
        viewService.incrementView(article.id).catch(err => {
            console.error('View increment error:', err);
        });

        res.json({
            ...article,
            tags,
            url: buildArticleUrl(article.published_at, article.slug)
        });
    } catch (error) {
        console.error('Get article error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

const getRelatedArticles = async (req, res) => {
    try {
        const { year, month, day, slug } = req.params;
        const limit = parseInt(req.query.limit) || 4;

        // Get current article
        const [current] = await pool.query(`
      SELECT id, category_id FROM articles 
      WHERE slug = ? AND YEAR(published_at) = ? AND MONTH(published_at) = ? AND DAY(published_at) = ?
    `, [slug, year, month, day]);

        if (current.length === 0) {
            return res.status(404).json({ message: 'Artikel tidak ditemukan.' });
        }

        const articleId = current[0].id;
        const categoryId = current[0].category_id;

        // Get related by same category
        const [related] = await pool.query(`
      SELECT 
        a.id, a.title, a.slug, a.excerpt, a.featured_image, a.published_at,
        u.name as author_name
      FROM articles a
      JOIN users u ON a.author_id = u.id
      WHERE a.category_id = ? 
        AND a.id != ? 
        AND a.status = 'published'
      ORDER BY a.published_at DESC
      LIMIT ?
    `, [categoryId, articleId, limit]);

        const relatedWithUrl = related.map(article => ({
            ...article,
            url: buildArticleUrl(article.published_at, article.slug)
        }));

        res.json(relatedWithUrl);
    } catch (error) {
        console.error('Get related articles error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

const searchArticles = async (req, res) => {
    try {
        const { q, page = 1, limit = 10 } = req.query;

        if (!q) {
            return res.status(400).json({ message: 'Query pencarian diperlukan.' });
        }

        const { limit: limitNum, offset } = paginate(page, limit);

        const [articles] = await pool.query(`
      SELECT 
        a.id, a.title, a.slug, a.excerpt, a.featured_image, a.published_at,
        u.name as author_name,
        c.name as category_name, c.slug as category_slug,
        MATCH(a.title, a.excerpt) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance
      FROM articles a
      JOIN users u ON a.author_id = u.id
      JOIN categories c ON a.category_id = c.id
      WHERE a.status = 'published' 
        AND MATCH(a.title, a.excerpt) AGAINST(? IN NATURAL LANGUAGE MODE)
      ORDER BY relevance DESC
      LIMIT ? OFFSET ?
    `, [q, q, limitNum, offset]);

        const [[{ total }]] = await pool.query(`
      SELECT COUNT(*) as total FROM articles
      WHERE status = 'published' 
        AND MATCH(title, excerpt) AGAINST(? IN NATURAL LANGUAGE MODE)
    `, [q]);

        const articlesWithUrl = articles.map(article => ({
            ...article,
            url: buildArticleUrl(article.published_at, article.slug)
        }));

        res.json({
            articles: articlesWithUrl,
            query: q,
            pagination: {
                page: parseInt(page),
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Search articles error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// ================== ADMIN ==================

const getAllArticles = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, search } = req.query;
        const { limit: limitNum, offset } = paginate(page, limit);

        let query = `
      SELECT 
        a.id, a.title, a.slug, a.status, a.view_count, a.is_featured,
        a.published_at, a.created_at, a.updated_at,
        u.name as author_name,
        c.name as category_name
      FROM articles a
      JOIN users u ON a.author_id = u.id
      JOIN categories c ON a.category_id = c.id
    `;
        const params = [];
        const conditions = [];

        // Author can only see their own articles
        if (req.user.role !== 'admin') {
            conditions.push('a.author_id = ?');
            params.push(req.user.id);
        }

        // Status filter
        if (status) {
            conditions.push('a.status = ?');
            params.push(status);
        }

        // Search filter
        if (search) {
            conditions.push('a.title LIKE ?');
            params.push(`%${search}%`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY a.updated_at DESC LIMIT ? OFFSET ?';
        params.push(limitNum, offset);

        const [articles] = await pool.query(query, params);

        // Add URL to published articles
        const articlesWithUrl = articles.map(article => ({
            ...article,
            url: article.published_at ? buildArticleUrl(article.published_at, article.slug) : null
        }));

        res.json({ articles: articlesWithUrl });
    } catch (error) {
        console.error('Get all articles error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

const getArticleById = async (req, res) => {
    try {
        const { id } = req.params;

        let query = `
      SELECT a.*, c.name as category_name
      FROM articles a
      JOIN categories c ON a.category_id = c.id
      WHERE a.id = ?
    `;
        const params = [id];

        if (req.user.role !== 'admin') {
            query += ' AND a.author_id = ?';
            params.push(req.user.id);
        }

        const [articles] = await pool.query(query, params);

        if (articles.length === 0) {
            return res.status(404).json({ message: 'Artikel tidak ditemukan.' });
        }

        // Get tags
        const [tags] = await pool.query(`
      SELECT t.id, t.name, t.slug
      FROM tags t
      JOIN article_tags at ON t.id = at.tag_id
      WHERE at.article_id = ?
    `, [id]);

        res.json({ ...articles[0], tags });
    } catch (error) {
        console.error('Get article by id error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

const createArticle = async (req, res) => {
    try {
        const { title, content, excerpt, featured_image, category_id, tags, status } = req.body;

        if (!title || !content || !category_id) {
            return res.status(400).json({ message: 'Title, content, dan kategori diperlukan.' });
        }

        const slug = createSlug(title);
        const published_at = status === 'published' ? new Date() : null;

        const [result] = await pool.query(`
      INSERT INTO articles (title, slug, author_id, category_id, content, excerpt, featured_image, status, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, slug, req.user.id, category_id, JSON.stringify(content), excerpt, featured_image, status || 'draft', published_at]);

        const articleId = result.insertId;

        // Process tags (tag names, auto-create if not exists)
        if (tags && tags.length > 0) {
            const tagIds = await processTagNames(tags);
            await linkTagsToArticle(articleId, tagIds);
        }

        res.status(201).json({
            message: 'Artikel berhasil dibuat.',
            id: articleId,
            url: published_at ? buildArticleUrl(published_at, slug) : null
        });
    } catch (error) {
        console.error('Create article error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

const updateArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, excerpt, featured_image, category_id, tags, status } = req.body;

        // Check ownership
        let checkQuery = 'SELECT * FROM articles WHERE id = ?';
        const checkParams = [id];
        if (req.user.role !== 'admin') {
            checkQuery += ' AND author_id = ?';
            checkParams.push(req.user.id);
        }

        const [existing] = await pool.query(checkQuery, checkParams);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Artikel tidak ditemukan.' });
        }

        const article = existing[0];
        let published_at = article.published_at;

        // If publishing for first time
        if (status === 'published' && article.status === 'draft') {
            published_at = new Date();
        }

        const slug = title ? createSlug(title) : article.slug;

        await pool.query(`
      UPDATE articles 
      SET title = ?, slug = ?, category_id = ?, content = ?, excerpt = ?, 
          featured_image = ?, status = ?, published_at = ?
      WHERE id = ?
    `, [
            title || article.title,
            slug,
            category_id || article.category_id,
            content ? JSON.stringify(content) : article.content,
            excerpt !== undefined ? excerpt : article.excerpt,
            featured_image !== undefined ? featured_image : article.featured_image,
            status || article.status,
            published_at,
            id
        ]);

        // Update tags (tag names, auto-create if not exists)
        if (tags !== undefined) {
            const tagIds = tags.length > 0 ? await processTagNames(tags) : [];
            await linkTagsToArticle(id, tagIds);
        }

        res.json({
            message: 'Artikel berhasil diupdate.',
            url: published_at ? buildArticleUrl(published_at, slug) : null
        });
    } catch (error) {
        console.error('Update article error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

const deleteArticle = async (req, res) => {
    try {
        const { id } = req.params;

        let query = 'DELETE FROM articles WHERE id = ?';
        const params = [id];
        if (req.user.role !== 'admin') {
            query = 'DELETE FROM articles WHERE id = ? AND author_id = ?';
            params.push(req.user.id);
        }

        const [result] = await pool.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Artikel tidak ditemukan.' });
        }

        res.json({ message: 'Artikel berhasil dihapus.' });
    } catch (error) {
        console.error('Delete article error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// Archive
const getArchives = async (req, res) => {
    try {
        const { year, month } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const { limit: limitNum, offset } = paginate(page, limit);

        let query = `
      SELECT 
        a.id, a.title, a.slug, a.excerpt, a.featured_image, a.published_at,
        u.name as author_name,
        c.name as category_name, c.slug as category_slug
      FROM articles a
      JOIN users u ON a.author_id = u.id
      JOIN categories c ON a.category_id = c.id
      WHERE a.status = 'published' AND YEAR(a.published_at) = ?
    `;
        const params = [year];

        if (month) {
            query += ' AND MONTH(a.published_at) = ?';
            params.push(month);
        }

        query += ' ORDER BY a.published_at DESC LIMIT ? OFFSET ?';
        params.push(limitNum, offset);

        const [articles] = await pool.query(query, params);

        const articlesWithUrl = articles.map(article => ({
            ...article,
            url: buildArticleUrl(article.published_at, article.slug)
        }));

        res.json({ articles: articlesWithUrl });
    } catch (error) {
        console.error('Get archives error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

const toggleFeatured = async (req, res) => {
    try {
        const { id } = req.params;

        // Toggle the featured status
        await pool.query(
            'UPDATE articles SET is_featured = NOT is_featured WHERE id = ?',
            [id]
        );

        const [[article]] = await pool.query(
            'SELECT id, is_featured FROM articles WHERE id = ?',
            [id]
        );

        res.json({
            message: article.is_featured ? 'Artikel ditandai unggulan' : 'Artikel dihapus dari unggulan',
            is_featured: article.is_featured
        });
    } catch (error) {
        console.error('Toggle featured error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = {
    getArticles,
    getFeaturedArticles,
    getTrendingArticles,
    getArticleBySlug,
    getRelatedArticles,
    searchArticles,
    getAllArticles,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticle,
    getArchives,
    toggleFeatured
};
