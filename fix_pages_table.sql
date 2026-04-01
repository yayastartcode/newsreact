ALTER TABLE pages
ADD COLUMN author_id INT AFTER status,
ADD COLUMN excerpt TEXT AFTER content,
ADD COLUMN featured_image VARCHAR(255) AFTER excerpt,
ADD COLUMN meta_title VARCHAR(255) AFTER featured_image,
ADD COLUMN meta_description TEXT AFTER meta_title;

-- Note: Because author_id references users, we can add a foreign key constraint
ALTER TABLE pages 
ADD CONSTRAINT fk_pages_author 
FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL;
