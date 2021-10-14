import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import sveltePreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
import css from 'rollup-plugin-css-only';
import copy from 'rollup-plugin-copy';
import replace from 'rollup-plugin-re';

const production = !process.env.ROLLUP_WATCH;
const remove_transform_animations = process.env.REMOVE_TRANSFORM_ANIMATIONS;
if (remove_transform_animations) {
	console.log('CSS transform animations will be removed for compatibility.\n');
} else {
	console.log('CSS transform animations will be enabled.\n');
}

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

export default {
	input: 'src/main.ts',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'public/build/bundle.js'
	},
	plugins: [
		replace({
			patterns: [
				{
					exclude: remove_transform_animations ? [] : ['**'],
					test: /in\:receive\|local=\{\{ key: .*? \}\}/,
					replace: '',
				},
				{
					exclude: remove_transform_animations ? [] : ['**'],
					test: /out\:send\|local=\{\{ key: .*? \}\}/,
					replace: '',
				},
				{
					exclude: remove_transform_animations ? [] : ['**'],
					test: /animate\:flip\=\{animationOptions\}/,
					replace: 'transition:fade|local',
				},
			],
		}),
		svelte({
			preprocess: sveltePreprocess({
				sourceMap: !production,
				transformers: {
					scss: {
						includePaths: [
							'node_modules',
							'src'
						]
					}
				}
			}),
			compilerOptions: {
				// enable run-time checks when not in production
				dev: !production
			}
		}),
		// manually copy fontsource fonts, since rollup refuses to do it on its own
		copy({
			targets: [
				{ src: 'node_modules/@fontsource/*/files/*', dest: 'public/build/files' }
			]
		}),
		// we'll extract any component CSS out into
		// a separate file - better for performance
		css({ output: 'bundle.css' }),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: ['svelte']
		}),
		commonjs(),
		typescript({
			sourceMap: !production,
			inlineSources: !production
		}),

		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!production && serve(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload('public'),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()
	],
	watch: {
		clearScreen: false
	}
};
