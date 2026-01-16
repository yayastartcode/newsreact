-- Pages table (static pages like About, Contact, Privacy Policy)
CREATE TABLE IF NOT EXISTS pages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content JSON,
    excerpt TEXT,
    featured_image VARCHAR(500),
    status ENUM('draft', 'published') DEFAULT 'draft',
    author_id INT NOT NULL,
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    url VARCHAR(500),
    type ENUM('custom', 'page', 'category') DEFAULT 'custom',
    reference_id INT,
    parent_id INT DEFAULT NULL,
    position INT DEFAULT 0,
    target ENUM('_self', '_blank') DEFAULT '_self',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

-- Site settings table
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type ENUM('text', 'image', 'json', 'boolean') DEFAULT 'text',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO settings (setting_key, setting_value, setting_type) VALUES
('site_name', 'NewsReact', 'text'),
('site_description', 'Portal Berita Terkini', 'text'),
('logo', NULL, 'image'),
('logo_dark', NULL, 'image'),
('favicon', NULL, 'image'),
('footer_text', '© 2026 NewsReact. All rights reserved.', 'text'),
('social_facebook', '', 'text'),
('social_twitter', '', 'text'),
('social_instagram', '', 'text'),
('social_youtube', '', 'text')
ON DUPLICATE KEY UPDATE setting_key = setting_key;

-- Create index for faster menu queries
CREATE INDEX idx_menu_position ON menu_items(position);
CREATE INDEX idx_menu_parent ON menu_items(parent_id);
