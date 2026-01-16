import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';

export default defineConfig({
    integrations: [react()],
    output: 'server',
    adapter: node({
        mode: 'standalone'
    }),
    server: {
        port: 4321
    },
    vite: {
        define: {
            'import.meta.env.API_URL': JSON.stringify(process.env.API_URL || 'http://localhost:5000/api')
        }
    }
});
