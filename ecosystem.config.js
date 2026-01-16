module.exports = {
    apps: [
        {
            name: "news-backend",
            script: "./server/app.js",
            env: {
                NODE_ENV: "production",
                PORT: 5001,
                // Isi env vars lain di server/.env, tapi ini backup
            },
            watch: false,
            instances: 1,
            exec_mode: "fork"
        },
        {
            name: "news-frontend",
            script: "./public/dist/server/entry.mjs",
            env: {
                NODE_ENV: "production",
                PORT: 4321,
                HOST: "127.0.0.1"
            },
            watch: false,
            instances: 1,
            exec_mode: "fork" // Astro SSR biasanya single instance kecuali dikonfigurasi cluster
        }
    ]
};
