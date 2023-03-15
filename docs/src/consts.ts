export const SITE = {
	title: 'Bloomreach SPA SDKs',
	description: `Bloomreach provides an SPA SDK for integrating SPAs and other Javascript front-end applications with Bloomreach Content's Delivery API and the preview and editing capabilities of the Experience manager application.`,
	defaultLanguage: 'en-us',
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

export const KNOWN_LANGUAGES = {
	English: 'en',
} as const;
export const KNOWN_LANGUAGE_CODES = Object.values(KNOWN_LANGUAGES);

export const GITHUB_EDIT_URL = `https://github.com/withastro/astro/tree/main/examples/docs`;

export const COMMUNITY_INVITE_URL = `https://astro.build/chat`;

// See "Algolia" section of the README for more information.
export const ALGOLIA = {
	indexName: 'XXXXXXXXXX',
	appId: 'XXXXXXXXXX',
	apiKey: 'XXXXXXXXXX',
};

export type Sidebar = Record<
	(typeof KNOWN_LANGUAGE_CODES)[number],
	Record<string, { text: string; link: string }[]>
>;
export const SIDEBAR: Sidebar = {
	en: {
		'Content SaaS': [
			{ text: 'Getting started', link: '/en/getting-started' },
			{ text: 'Configuration', link: '/en/configuration' },
			{ text: 'React SPA SDK', link: '/en/react' },
			{ text: 'Angular SPA SDK', link: '/en/angular' },
			{ text: 'Vue 2 SPA SDK', link: '/en/vue-2' },
			{ text: 'Vue 3 SPA SDK', link: '/en/vue-3' },
			{ text: 'Framework agnostic SPA SDK', link: '/en/spa-sdk' },
			{ text: 'Internal reference', link: '/en/reference-saas' },
		],
		'Content PaaS': [
			{ text: 'Relevance integration', link: '/en/relevance-integration' },
			{ text: 'Internal reference', link: '/en/reference-paas' },
		],
		'Migration': [
			{ text: 'v19', link: '/en/v19' },
			{ text: 'v18', link: '/en/v18' },
			{ text: 'v17', link: '/en/v17' },
			{ text: 'v15', link: '/en/v15' },
		],
	},
};
