# NewsReact - News CMS Website

Website berita online dengan Astro + React + Express + MySQL.

## Quick Start

### 1. Database Setup
```bash
# Buat database dan import schema
mysql -u root -p < database/schema.sql
```

### 2. Backend (Express API)
```bash
# Edit .env dengan kredensial database Anda
nano server/.env
```

### 3. Install & Run All Services
```bash
# Install semua dependencies (sekali saja)
npm run install:all

# Jalankan semua services bersamaan
npm run dev
```

Server berjalan di:
- **Public Site**: http://localhost:4321
- **Admin CMS**: http://localhost:5173
- **API**: http://localhost:5000

## Default Login
- Email: `admin@news.com`
- Password: `admin123`

## Production Build
```bash
# Build Astro
cd public && npm run build

# Build Admin
cd admin && npm run build

# Copy nginx config
sudo cp nginx/newsreact.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/newsreact.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## Struktur Project
```
newsreact/
├── public/          # Astro (public site)
├── admin/           # React (admin CMS)
├── server/          # Express (API)
├── database/        # SQL schema
└── nginx/           # Nginx config
```

## Fitur
- ✅ WYSIWYG Editor (Editor.js)
- ✅ Kategori & Tags
- ✅ URL tanggal: /2026/01/14/slug
- ✅ Halaman penulis
- ✅ Arsip
- ✅ Pencarian
- ✅ Related articles
- ✅ Social share
- ✅ View analytics
- ✅ Ad placements
- ✅ Role: Admin & Author
