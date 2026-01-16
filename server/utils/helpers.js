const slugify = require('slugify');

const createSlug = (text) => {
    return slugify(text, {
        lower: true,
        strict: true,
        locale: 'id'
    });
};

const formatDatePath = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return { year, month, day };
};

const buildArticleUrl = (publishedAt, slug) => {
    const { year, month, day } = formatDatePath(publishedAt);
    return `/${year}/${month}/${day}/${slug}`;
};

const paginate = (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    return { limit: parseInt(limit), offset };
};

module.exports = {
    createSlug,
    formatDatePath,
    buildArticleUrl,
    paginate
};
