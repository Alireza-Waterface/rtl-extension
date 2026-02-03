import './styles.css';

const PERSIAN_REGEX = /[\u0600-\u06FF]/;
const RTL_CLASS = 'rtl-content-block';

const BLOCK_TAGS = new Set([
  'P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'LI', 'TD', 'TH', 'BLOCKQUOTE', 'ARTICLE', 'SECTION', 'MAIN'
]);

const CODE_TAGS = new Set(['CODE', 'PRE', 'SCRIPT', 'STYLE']);

const getBlockParent = (node: Node): HTMLElement | null => {
	let current = node.parentElement;

	while (current) {
		if (current.tagName === 'BODY' || current.tagName === 'HTML') return null;

		if (CODE_TAGS.has(current.tagName) || current.classList.contains('hljs')) return null;

		if (BLOCK_TAGS.has(current.tagName)) {
			return current;
		}

		current = current.parentElement;
	}
	return null;
};

const processTextNode = (textNode: Node) => {
	const text = textNode.nodeValue;

	if (text && PERSIAN_REGEX.test(text)) {
		const blockParent = getBlockParent(textNode);

		if (blockParent) {
			if (blockParent.classList.contains(RTL_CLASS)) return;
			blockParent.classList.add(RTL_CLASS);
		}
	}
};

const scanFromRoot = (root: Node) => {
	const walker = document.createTreeWalker(
		root,
		NodeFilter.SHOW_TEXT,
		{
			acceptNode: (node) => {
				if (!node.nodeValue || node.nodeValue.trim().length === 0) {
					return NodeFilter.FILTER_REJECT;
				}
				const parentTag = node.parentElement?.tagName;
				if (parentTag && (CODE_TAGS.has(parentTag))) {
					return NodeFilter.FILTER_REJECT;
				}
				return NodeFilter.FILTER_ACCEPT;
			}
		}
	);

	while (walker.nextNode()) {
		processTextNode(walker.currentNode);
	}
};

scanFromRoot(document.body);

const observer = new MutationObserver((mutations) => {
	mutations.forEach((mutation) => {
		mutation.addedNodes.forEach((node) => {
			scanFromRoot(node);
		});

		if (mutation.type === 'characterData') {
			processTextNode(mutation.target);
		}
	});
});

if (document.body) {
	observer.observe(document.body, {
		childList: true,
		subtree: true,
		characterData: true,
	});
}