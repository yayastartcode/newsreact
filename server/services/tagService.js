const pool = require('../config/db');
const { createSlug } = require('../utils/helpers');

/**
 * Process tag names and return tag IDs
 * Creates new tags if they don't exist
 * @param {string[]} tagNames - Array of tag names
 * @returns {Promise<number[]>} - Array of tag IDs
 */
const processTagNames = async (tagNames) => {
    if (!tagNames || tagNames.length === 0) return [];

    const tagIds = [];

    for (const name of tagNames) {
        const trimmedName = name.trim();
        if (!trimmedName) continue;

        const slug = createSlug(trimmedName);

        // Check if tag exists
        const [existing] = await pool.query(
            'SELECT id FROM tags WHERE slug = ? OR name = ?',
            [slug, trimmedName]
        );

        if (existing.length > 0) {
            // Tag exists, use existing ID
            tagIds.push(existing[0].id);
        } else {
            // Create new tag
            const [result] = await pool.query(
                'INSERT INTO tags (name, slug) VALUES (?, ?)',
                [trimmedName, slug]
            );
            tagIds.push(result.insertId);
        }
    }

    return tagIds;
};

/**
 * Search tags by name (for autocomplete)
 * @param {string} query - Search query
 * @param {number} limit - Max results
 * @returns {Promise<Array>} - Matching tags
 */
const searchTags = async (query, limit = 10) => {
    const [tags] = await pool.query(
        'SELECT id, name, slug FROM tags WHERE name LIKE ? ORDER BY name ASC LIMIT ?',
        [`%${query}%`, limit]
    );
    return tags;
};

/**
 * Link tags to article
 * @param {number} articleId - Article ID
 * @param {number[]} tagIds - Array of tag IDs
 */
const linkTagsToArticle = async (articleId, tagIds) => {
    // Remove existing links
    await pool.query('DELETE FROM article_tags WHERE article_id = ?', [articleId]);

    // Add new links
    if (tagIds.length > 0) {
        const tagValues = tagIds.map(tagId => [articleId, tagId]);
        await pool.query('INSERT INTO article_tags (article_id, tag_id) VALUES ?', [tagValues]);
    }
};

module.exports = {
    processTagNames,
    searchTags,
    linkTagsToArticle
};
