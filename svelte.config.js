import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import * as child_process from 'node:child_process';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter(),

		version: {
			name: process.env.PUTTABLE_APP_VERSION || "test"
		},

		// Configuration for reverse proxy support
		paths: {
			base: process.env.BASE_PATH || ''
		},
		// Allow the server to be accessed through a proxy
		csrf: {
			checkOrigin: process.env.CHECK_ORIGIN !== 'false'
		}
	}
};

export default config;
