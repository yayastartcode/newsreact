const pool = require('../config/db');

// Demo data articles
const demoArticles = [
    // Teknologi (4 articles)
    {
        title: 'Apple Luncurkan iPhone 17 dengan Teknologi AI Canggih',
        slug: 'apple-luncurkan-iphone-17-teknologi-ai-canggih',
        excerpt: 'Apple resmi memperkenalkan iPhone 17 dengan chip A19 Bionic dan fitur AI generatif terintegrasi.',
        content: JSON.stringify({
            blocks: [
                { type: 'paragraph', data: { text: 'Apple mengumumkan peluncuran iPhone 17 di event tahunan mereka di Cupertino, California. Smartphone terbaru ini hadir dengan chip A19 Bionic yang diklaim 40% lebih cepat dari generasi sebelumnya.' } },
                { type: 'paragraph', data: { text: 'Fitur unggulan dari iPhone 17 adalah integrasi AI generatif yang memungkinkan pengguna untuk mengedit foto, menulis email, dan bahkan membuat ringkasan dokumen hanya dengan perintah suara.' } },
                { type: 'paragraph', data: { text: 'iPhone 17 akan tersedia dalam tiga varian: iPhone 17, iPhone 17 Pro, dan iPhone 17 Pro Max dengan harga mulai dari $999.' } }
            ]
        }),
        category: 'Teknologi',
        status: 'published'
    },
    {
        title: 'Google Gemini 3.0 Mampu Menulis Kode Lebih Akurat',
        slug: 'google-gemini-3-mampu-menulis-kode-lebih-akurat',
        excerpt: 'Model AI terbaru Google menunjukkan peningkatan signifikan dalam kemampuan coding dan reasoning.',
        content: JSON.stringify({
            blocks: [
                { type: 'paragraph', data: { text: 'Google mengumumkan Gemini 3.0, generasi terbaru dari model AI mereka yang menunjukkan kemampuan luar biasa dalam menulis dan debugging kode program.' } },
                { type: 'paragraph', data: { text: 'Dalam benchmark internal, Gemini 3.0 berhasil menyelesaikan 94% tantangan coding dengan benar, meningkat dari 78% pada versi sebelumnya.' } },
                { type: 'paragraph', data: { text: 'Model ini juga dilengkapi dengan kemampuan multimodal yang memungkinkan analisis gambar dan video secara real-time.' } }
            ]
        }),
        category: 'Teknologi',
        status: 'published'
    },
    {
        title: 'Tesla Cybertruck Mulai Dikirim ke Indonesia',
        slug: 'tesla-cybertruck-mulai-dikirim-indonesia',
        excerpt: 'Tesla resmi memulai pengiriman Cybertruck ke pasar Indonesia dengan harga kompetitif.',
        content: JSON.stringify({
            blocks: [
                { type: 'paragraph', data: { text: 'Tesla Indonesia mengumumkan bahwa pengiriman unit pertama Cybertruck akan dimulai bulan depan. Pickup truck elektrik ini sudah ditunggu-tunggu oleh banyak konsumen Indonesia.' } },
                { type: 'paragraph', data: { text: 'Cybertruck hadir dengan baterai 200 kWh yang mampu menempuh jarak hingga 800 km dalam sekali pengisian. Kecepatan maksimumnya mencapai 200 km/jam.' } },
                { type: 'paragraph', data: { text: 'Harga Cybertruck di Indonesia dibanderol mulai dari Rp 1,2 miliar untuk varian dasar.' } }
            ]
        }),
        category: 'Teknologi',
        status: 'published'
    },
    {
        title: 'Startup Lokal Kembangkan Chip AI Buatan Indonesia',
        slug: 'startup-lokal-kembangkan-chip-ai-buatan-indonesia',
        excerpt: 'Sebuah startup teknologi Indonesia berhasil mengembangkan chip AI pertama yang diproduksi dalam negeri.',
        content: JSON.stringify({
            blocks: [
                { type: 'paragraph', data: { text: 'PT Nusantara Chip, startup teknologi asal Bandung, berhasil mengembangkan chip AI pertama buatan Indonesia bernama "Garuda AI-1".' } },
                { type: 'paragraph', data: { text: 'Chip ini dirancang khusus untuk aplikasi IoT dan edge computing, dengan konsumsi daya yang sangat rendah namun performa tinggi.' } },
                { type: 'paragraph', data: { text: 'Menteri Komunikasi dan Digital menyambut baik pencapaian ini sebagai langkah maju dalam kemandirian teknologi nasional.' } }
            ]
        }),
        category: 'Teknologi',
        status: 'published'
    },
    // Bisnis (2 articles)
    {
        title: 'Bank Indonesia Pertahankan Suku Bunga di Level 5,75%',
        slug: 'bank-indonesia-pertahankan-suku-bunga-5-75-persen',
        excerpt: 'Rapat Dewan Gubernur BI memutuskan untuk mempertahankan suku bunga acuan demi stabilitas ekonomi.',
        content: JSON.stringify({
            blocks: [
                { type: 'paragraph', data: { text: 'Bank Indonesia memutuskan untuk mempertahankan suku bunga acuan BI Rate di level 5,75% dalam Rapat Dewan Gubernur yang digelar hari ini.' } },
                { type: 'paragraph', data: { text: 'Keputusan ini diambil untuk menjaga stabilitas nilai tukar Rupiah dan mengendalikan inflasi yang masih dalam target pemerintah.' } },
                { type: 'paragraph', data: { text: 'Gubernur BI menyatakan bahwa kebijakan moneter akan terus dievaluasi sesuai dengan perkembangan ekonomi global.' } }
            ]
        }),
        category: 'Bisnis',
        status: 'published'
    },
    {
        title: 'IHSG Tembus 8.000 untuk Pertama Kalinya',
        slug: 'ihsg-tembus-8000-pertama-kalinya',
        excerpt: 'Indeks Harga Saham Gabungan mencatatkan rekor tertinggi sepanjang sejarah bursa Indonesia.',
        content: JSON.stringify({
            blocks: [
                { type: 'paragraph', data: { text: 'Indeks Harga Saham Gabungan (IHSG) berhasil menembus level psikologis 8.000 untuk pertama kalinya dalam sejarah pasar modal Indonesia.' } },
                { type: 'paragraph', data: { text: 'Penguatan ini didorong oleh sentimen positif dari investor asing yang kembali masuk ke pasar Indonesia serta kinerja emiten yang solid.' } },
                { type: 'paragraph', data: { text: 'Saham-saham sektor perbankan dan teknologi menjadi pendorong utama kenaikan indeks.' } }
            ]
        }),
        category: 'Bisnis',
        status: 'published'
    },
    // Olahraga (2 articles)
    {
        title: 'Timnas Indonesia Lolos ke Piala Dunia 2026',
        slug: 'timnas-indonesia-lolos-piala-dunia-2026',
        excerpt: 'Untuk pertama kalinya dalam sejarah, Indonesia berhasil lolos ke putaran final Piala Dunia.',
        content: JSON.stringify({
            blocks: [
                { type: 'paragraph', data: { text: 'Sejarah baru tercipta! Timnas Indonesia resmi lolos ke Piala Dunia 2026 setelah mengalahkan Arab Saudi dengan skor 2-1 di Stadion Gelora Bung Karno.' } },
                { type: 'paragraph', data: { text: 'Gol kemenangan Indonesia dicetak oleh striker muda berbakat dari Liga Inggris pada menit ke-89, memicu euforia jutaan suporter di seluruh Indonesia.' } },
                { type: 'paragraph', data: { text: 'Presiden RI langsung memberikan selamat dan menyatakan akan memberikan bonus khusus untuk para pemain dan ofisial tim.' } }
            ]
        }),
        category: 'Olahraga',
        status: 'published'
    },
    {
        title: 'Badminton Indonesia Raih 3 Emas di Olimpiade',
        slug: 'badminton-indonesia-raih-3-emas-olimpiade',
        excerpt: 'Kontingen bulutangkis Indonesia mencatatkan prestasi gemilang dengan meraih 3 medali emas.',
        content: JSON.stringify({
            blocks: [
                { type: 'paragraph', data: { text: 'Tim bulutangkis Indonesia berhasil meraih 3 medali emas di Olimpiade, menegaskan dominasi Indonesia di cabang olahraga ini.' } },
                { type: 'paragraph', data: { text: 'Emas diraih dari nomor tunggal putra, ganda putra, dan ganda campuran. Ini merupakan pencapaian terbaik Indonesia di cabang bulutangkis sejak 2004.' } },
                { type: 'paragraph', data: { text: 'Menpora menyatakan prestasi ini adalah hasil dari program pembinaan jangka panjang yang dilakukan PBSI.' } }
            ]
        }),
        category: 'Olahraga',
        status: 'published'
    },
    // Hiburan (2 articles)
    {
        title: 'Film Indonesia Masuk Nominasi Oscar 2026',
        slug: 'film-indonesia-masuk-nominasi-oscar-2026',
        excerpt: 'Untuk pertama kalinya, film Indonesia masuk dalam nominasi Best International Feature Film.',
        content: JSON.stringify({
            blocks: [
                { type: 'paragraph', data: { text: 'Academy Awards mengumumkan bahwa film Indonesia "Tanah Air" masuk dalam nominasi Best International Feature Film Oscar 2026.' } },
                { type: 'paragraph', data: { text: 'Film yang disutradarai oleh sineas muda ini mengisahkan perjuangan nelayan tradisional menghadapi perubahan iklim dan modernisasi.' } },
                { type: 'paragraph', data: { text: 'Menteri Pendidikan dan Kebudayaan menyatakan ini adalah pencapaian bersejarah bagi perfilman Indonesia.' } }
            ]
        }),
        category: 'Hiburan',
        status: 'published'
    },
    {
        title: 'Konser Coldplay di Jakarta Pecahkan Rekor Penonton',
        slug: 'konser-coldplay-jakarta-pecahkan-rekor-penonton',
        excerpt: 'Konser Coldplay di GBK menarik lebih dari 100.000 penonton dalam satu malam.',
        content: JSON.stringify({
            blocks: [
                { type: 'paragraph', data: { text: 'Band rock asal Inggris, Coldplay, berhasil memecahkan rekor penonton konser di Indonesia dengan menarik lebih dari 100.000 penonton di Stadion GBK.' } },
                { type: 'paragraph', data: { text: 'Konser yang berlangsung selama 3 jam ini menampilkan lagu-lagu hits seperti "Yellow", "Fix You", dan "Viva La Vida".' } },
                { type: 'paragraph', data: { text: 'Chris Martin, vokalis Coldplay, menyatakan kecintaannya pada Indonesia dan berjanji akan kembali tahun depan.' } }
            ]
        }),
        category: 'Hiburan',
        status: 'published'
    }
];

// Track demo data IDs
let insertedArticleIds = [];

const seedDemoData = async () => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Get or create categories
        const categoryMap = {};
        const categories = ['Teknologi', 'Bisnis', 'Olahraga', 'Hiburan'];

        for (const catName of categories) {
            const slug = catName.toLowerCase();
            const [existing] = await connection.query(
                'SELECT id FROM categories WHERE slug = ?', [slug]
            );

            if (existing.length > 0) {
                categoryMap[catName] = existing[0].id;
            } else {
                const [result] = await connection.query(
                    'INSERT INTO categories (name, slug) VALUES (?, ?)',
                    [catName, slug]
                );
                categoryMap[catName] = result.insertId;
            }
        }

        // Get admin user ID
        const [[adminUser]] = await connection.query(
            'SELECT id FROM users WHERE role = "admin" LIMIT 1'
        );
        const authorId = adminUser?.id || 1;

        // Insert demo articles
        insertedArticleIds = [];

        for (const article of demoArticles) {
            const [result] = await connection.query(`
                INSERT INTO articles 
                (title, slug, excerpt, content, category_id, author_id, status, is_demo, created_at, published_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
            `, [
                article.title,
                article.slug,
                article.excerpt,
                article.content,
                categoryMap[article.category],
                authorId,
                article.status
            ]);

            insertedArticleIds.push(result.insertId);
        }

        await connection.commit();

        return {
            success: true,
            message: `Berhasil membuat ${insertedArticleIds.length} artikel demo`,
            articleIds: insertedArticleIds,
            categories: Object.keys(categoryMap)
        };

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const deleteDemoData = async () => {
    try {
        // Delete all articles marked as demo
        const [result] = await pool.query('DELETE FROM articles WHERE is_demo = 1');

        return {
            success: true,
            message: `Berhasil menghapus ${result.affectedRows} artikel demo`,
            deletedCount: result.affectedRows
        };

    } catch (error) {
        throw error;
    }
};

const getDemoStats = async () => {
    try {
        const [[stats]] = await pool.query(`
            SELECT COUNT(*) as count FROM articles WHERE is_demo = 1
        `);

        return {
            demoArticleCount: stats.count
        };

    } catch (error) {
        throw error;
    }
};

module.exports = {
    seedDemoData,
    deleteDemoData,
    getDemoStats
};
