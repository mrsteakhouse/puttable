import {sveltekit} from '@sveltejs/kit/vite';
import {defineConfig} from 'vite';

export default defineConfig(({mode}) => {
    const proxy = mode === "development" ? {
        server: {
            proxy: {
                '/api': 'http://backend:8000',
            }
        }
    } : {};
    return {
        plugins: [sveltekit()],
        ...proxy
    };
});
