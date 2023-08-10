import '@docsearch/css';
import './Search.css';

import { DocSearch } from '@docsearch/react';

export default function Search(): JSX.Element {
	return (
		<DocSearch
			indexName={import.meta.env.PUBLIC_ALGOLIA_SEARCH_INDEX_NAME}
			appId={import.meta.env.PUBLIC_ALGOLIA_APP_ID}
			apiKey={import.meta.env.PUBLIC_ALGOLIA_SEARCH_API_KEY}
			transformItems={(items) => {
				return items.map((item) => {
					// We transform the absolute URL into a relative URL to
					// work better on localhost, preview URLS.
					const a = document.createElement('a');
					a.href = item.url;
					const hash = a.hash === '#overview' ? '' : a.hash;
					return {
						...item,
						url: `${a.pathname}${hash}`,
					};
				});
			}}
		/>
	);
}
