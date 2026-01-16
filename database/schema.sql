-- =============================================
-- News CMS Database Schema (FINAL)
-- =============================================

CREATE DATABASE IF NOT EXISTS news_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE news_db;

-- 1. Users (Admin, Author)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    bio TEXT,
    role ENUM('admin', 'author') DEFAULT 'author',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tags
CREATE TABLE tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL
);

-- 4. Pages (Static Pages)
CREATE TABLE pages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content JSON,
    status ENUM('draft', 'published') DEFAULT 'draft',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Articles
CREATE TABLE articles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    author_id INT NOT NULL,
    category_id INT NOT NULL,
    content JSON NOT NULL,
    excerpt TEXT,
    featured_image VARCHAR(255),
    status ENUM('draft', 'published') DEFAULT 'draft',
    view_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    UNIQUE KEY unique_date_slug (published_at, slug),
    INDEX idx_status_published (status, published_at DESC), -- Optimize "Latest News" query
    INDEX idx_category_status (category_id, status, published_at DESC), -- Optimize "Category Page" query
    INDEX idx_author (author_id),
    INDEX idx_is_featured (is_featured, status, published_at DESC), -- Optimize "Featured News" query
    FULLTEXT idx_search (title, excerpt) -- Optimize Search
);

-- 6. Article-Tags relationship
CREATE TABLE article_tags (
    article_id INT,
    tag_id INT,
    PRIMARY KEY (article_id, tag_id),
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- 7. Media Library
CREATE TABLE media (
    id INT PRIMARY KEY AUTO_INCREMENT,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    path VARCHAR(255) NOT NULL,
    size INT,
    mime_type VARCHAR(100),
    uploaded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- 8. Ad Placements
CREATE TABLE ad_placements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    position ENUM('header', 'sidebar', 'in_article', 'footer') NOT NULL,
    code TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- 9. Menu Items
CREATE TABLE menu_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    url VARCHAR(255),
    type ENUM('custom', 'page', 'category', 'homepage') DEFAULT 'custom',
    reference_id INT,
    parent_id INT,
    position INT DEFAULT 0,
    target VARCHAR(20) DEFAULT '_self',
    menu_location ENUM('header', 'footer') DEFAULT 'header',
    FOREIGN KEY (parent_id) REFERENCES menu_items(id) ON DELETE CASCADE,
    INDEX idx_menu_location (menu_location, position)
);

-- 10. Settings (Global Configuration)
CREATE TABLE settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    setting_value TEXT,
    setting_type VARCHAR(20) DEFAULT 'text',
    setting_group VARCHAR(50) DEFAULT 'general',
    is_public BOOLEAN DEFAULT FALSE
);

-- =============================================
-- Seed Data (Initial)
-- =============================================

-- Default admin user (password: admin123)
-- Hash: $2a$10$bNVK7iJJvZJrj5B2UZOVHOTFLpdsqDENxPFl5kkhAcL4CaYWVZjyi
INSERT INTO users (name, email, password, role) VALUES 
('Admin', 'admin@news.com', '$2a$10$bNVK7iJJvZJrj5B2UZOVHOTFLpdsqDENxPFl5kkhAcL4CaYWVZjyi', 'admin');

-- Sample categories
INSERT INTO categories (name, slug, description) VALUES 
('Berita Terbaru', 'berita-terbaru', 'Berita terkini dan terupdate'),
('Politik', 'politik', 'Berita politik nasional dan internasional'),
('Ekonomi', 'ekonomi', 'Berita ekonomi dan bisnis'),
('Olahraga', 'olahraga', 'Berita olahraga terkini'),
('Teknologi', 'teknologi', 'Berita teknologi dan gadget');

-- Sample settings
INSERT INTO settings (setting_key, setting_value, is_public, setting_group) VALUES
('site_name', 'NewsReact', 1, 'general'),
('site_description', 'Portal berita modern dan terpercaya', 1, 'general'),
('footer_text', '© 2026 NewsReact. All rights reserved.', 1, 'general'),
('posts_per_page', '9', 1, 'homepage');

