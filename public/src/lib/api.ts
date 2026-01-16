// Note: For SSR, we need a server-accessible URL
const API_URL = import.meta.env.PUBLIC_API_URL || 'http://127.0.0.1:5001/api';

export async function fetchApi(endpoint: string, options = {}) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error(`API fetch error for ${endpoint}:`, error);
        throw error;
    }
}

export const api = {
    // Articles
    getArticles: (page = 1, limit = 10) =>
        fetchApi(`/articles?page=${page}&limit=${limit}`),

    getArticle: (year: string, month: string, day: string, slug: string) =>
        fetchApi(`/articles/${year}/${month}/${day}/${slug}`),

    getRelatedArticles: (year: string, month: string, day: string, slug: string, limit = 4) =>
        fetchApi(`/articles/${year}/${month}/${day}/${slug}/related?limit=${limit}`),

    searchArticles: (query: string, page = 1) =>
        fetchApi(`/search?q=${encodeURIComponent(query)}&page=${page}`),

    // Categories
    getCategories: () => fetchApi('/categories'),

    getCategoryArticles: (slug: string, page = 1) =>
        fetchApi(`/categories/${slug}/articles?page=${page}`),

    // Tags
    getTags: () => fetchApi('/tags'),

    getTagArticles: (slug: string, page = 1) =>
        fetchApi(`/tags/${slug}/articles?page=${page}`),

    // Author
    getAuthor: (id: string, page = 1) =>
        fetchApi(`/authors/${id}?page=${page}`),

    // Archives
    getArchives: (year: string, month?: string) =>
        fetchApi(`/archives/${year}${month ? `/${month}` : ''}`),

    // Ads
    getAds: (position?: string) =>
        fetchApi(`/ads${position ? `?position=${position}` : ''}`),

    // Menu
    getMenuItems: (location = 'header') => fetchApi(`/menu?location=${location}`),
};
