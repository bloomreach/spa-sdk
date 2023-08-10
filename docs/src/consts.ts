export const SITE = {
	title: 'Bloomreach SPA SDKs',
	description: `Bloomreach provides an SPA SDK for integrating SPAs and other Javascript front-end applications with Bloomreach Content's Delivery API and the preview and editing capabilities of the Experience manager application.`,
} as const;


export const OPEN_GRAPH = {
	image: {
		src: 'https://github.com/withastro/astro/blob/main/assets/social/banner-minimal.png?raw=true',
		alt:
			'astro logo on a starry expanse of space,' +
			' with a purple saturn-like planet floating in the right foreground',
	},
	twitter: 'astrodotbuild',
};

export const GITHUB_EDIT_URL = `https://github.com/withastro/astro/tree/main/examples/docs`;

export const COMMUNITY_INVITE_URL = `https://astro.build/chat`;

// See "Algolia" section of the README for more information.
export const ALGOLIA = {
	indexName: 'XXXXXXXXXX',
	appId: 'XXXXXXXXXX',
	apiKey: 'XXXXXXXXXX',
};

type MenuItem = { text: string; link: string; }
export type Sidebar = Record<string, MenuItem[]>

export const SIDEBAR: Sidebar = {
	'Getting started': [
		{ text: 'Getting started', link: '/getting-started' },
		{ text: 'Configuration', link: '/configuration' },
	],
	'SDK usage': [
		{ text: 'SPA SDK', link: '/spa-sdk' },
		{ text: 'React SDK', link: '/react' },
		{ text: 'Angular SDK', link: '/angular' },
		{ text: 'Vue 2 SDK', link: '/vue-2' },
		{ text: 'Vue 3 SDK', link: '/vue-3' },
	],
	'Migration': [
		{ text: 'Migration guide', link: '/migration-guide' },
		{ text: 'Release notes', link: '/release-notes' },
		{ text: 'Changelog', link: '/changelog' },
	],
	'Content SaaS': [
		{ text: 'Internal reference', link: '/reference-saas' },
	],
	'Content PaaS': [
		{ text: 'Relevance integration', link: '/relevance-integration' },
		{ text: 'Internal reference', link: '/reference-paas' },
	],
};
