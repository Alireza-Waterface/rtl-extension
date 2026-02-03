import './styles.css';

const PERSIAN_REGEX = /[\u0600-\u06FF]/;
const RTL_CLASS = 'rtl-content-block';
const VAZIR_CLASS = 'rtl-use-vazir';

let globalEnabled: boolean = true;
let useVazirFont = true;
let localOverride: boolean | null = null;

interface ExtensionStorageSchema {
  isEnabled: boolean;
  useVazir: boolean;
}

const DEFAULT_SETTINGS: ExtensionStorageSchema = {
  isEnabled: true,
  useVazir: true
};

const isEffectiveEnabled = () => localOverride !== null ? localOverride : globalEnabled;

const BLOCK_TAGS = new Set([
  'P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'LI', 'TD', 'TH', 'BLOCKQUOTE', 'ARTICLE', 'SECTION', 'MAIN', 'DD', 'DT'
]);
const CODE_TAGS = new Set(['CODE', 'PRE', 'SCRIPT', 'STYLE', 'NOSCRIPT']);

const getBlockParent = (node: Node): HTMLElement | null => {
	let current = node.parentElement;
	while (current) {
		if (current.tagName === 'BODY' || current.tagName === 'HTML') return null;
		if (CODE_TAGS.has(current.tagName) || current.classList.contains('hljs')) return null;
		if (BLOCK_TAGS.has(current.tagName)) return current;
		current = current.parentElement;
	}
	return null;
};

const processTextNode = (textNode: Node) => {
	if (!isEffectiveEnabled()) return;

	const text = textNode.nodeValue;
	if (text && PERSIAN_REGEX.test(text)) {
		const blockParent = getBlockParent(textNode);
		if (blockParent && !blockParent.classList.contains(RTL_CLASS)) {
			blockParent.classList.add(RTL_CLASS);
		}
	}
};

const scanFromRoot = (root: Node) => {
	if (!isEffectiveEnabled()) return;

	const walker = document.createTreeWalker(
		root,
		NodeFilter.SHOW_TEXT,
		{
			acceptNode: (node) => {
				if (!node.nodeValue || node.nodeValue.trim().length === 0) return NodeFilter.FILTER_REJECT;
				const parentTag = node.parentElement?.tagName;
				if (parentTag && (CODE_TAGS.has(parentTag))) return NodeFilter.FILTER_REJECT;
				return NodeFilter.FILTER_ACCEPT;
			}
		}
	);

	while (walker.nextNode()) {
		processTextNode(walker.currentNode);
	}
};

const cleanupStyles = () => {
  	document.querySelectorAll(`.${RTL_CLASS}`).forEach(el => el.classList.remove(RTL_CLASS));
};

const updateFontClass = () => {
	if (useVazirFont && isEffectiveEnabled()) {
		document.body.classList.add(VAZIR_CLASS);
	} else {
		document.body.classList.remove(VAZIR_CLASS);
	}
};

const refreshState = () => {
	updateFontClass();
	if (isEffectiveEnabled()) {
		scanFromRoot(document.body);
	} else {
		cleanupStyles();
	}
};

const initSettings = () => {
	const sessionVal = sessionStorage.getItem('rtl_local_override');
	if (sessionVal !== null) {
		localOverride = sessionVal === 'true';
	}

	chrome.storage.local.get(DEFAULT_SETTINGS as Record<string, any>, (items) => {
		const result = items as unknown as ExtensionStorageSchema;

		globalEnabled = result.isEnabled;
		useVazirFont = result.useVazir;

		// راه‌اندازی
		initObserver();
		refreshState();
	});
};

chrome.storage.onChanged.addListener((changes) => {
	let needsRefresh = false;
		if (changes.isEnabled) {
		globalEnabled = changes.isEnabled.newValue as ExtensionStorageSchema['isEnabled'];
		needsRefresh = true;
	}

	if (changes.useVazir) {
		useVazirFont = changes.useVazir.newValue as ExtensionStorageSchema['useVazir'];
		needsRefresh = true;
	}
	if (needsRefresh) refreshState();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
	if (message.type === 'GET_STATUS') {
		sendResponse({
			globalEnabled,
			localOverride,
			effectiveEnabled: isEffectiveEnabled(),
			useVazirFont
		});
	}
	else if (message.type === 'SET_LOCAL_STATE') {
		localOverride = message.value;

		if (localOverride === null) {
			sessionStorage.removeItem('rtl_local_override');
		} else {
			sessionStorage.setItem('rtl_local_override', String(localOverride));
		}

		refreshState();
		sendResponse({ success: true });
	}
});

let observer: MutationObserver | null = null;

const initObserver = () => {
	if (observer) return;
	observer = new MutationObserver((mutations) => {
		if (!isEffectiveEnabled()) return;
		mutations.forEach((mutation) => {
			mutation.addedNodes.forEach((node) => scanFromRoot(node));
			if (mutation.type === 'characterData') processTextNode(mutation.target);
		});
	});

	if (document.body) {
		observer.observe(document.body, { childList: true, subtree: true, characterData: true });
	}
};

initSettings();