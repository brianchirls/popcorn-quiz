(function () {
	/*
	polyfill for ie9
	http://code.google.com/p/rangy/issues/detail?id=67
	*/

	if (window.Range && Range.prototype && typeof Range.prototype.createContextualFragment == "undefined") {
		Range.prototype.createContextualFragment = function(html) {
			var node, doc, el, context, child;

			// "Let node the context object's start's node."
			node = this.startContainer;
			doc = node.ownerDocument;

			// "If the context object's start's node is null, raise an INVALID_STATE_ERR
			// exception and abort these steps."
			if (!node) {
				throw new Error("INVALID_STATE_ERR");
			}

			// "Let element be as follows, depending on node's interface:"
			// Document, Document Fragment: null
			el = null;

			// "Element: node"
			if (node.nodeType === Node.ELEMENT_NODE) {
				el = node;
				// "Text, Comment: node's parentElement"
			} else if (node.nodeType === Node.TEXT_NODE) { //text node
				el = node.parentNode;
			}

			// "If either element is null or element's ownerDocument is an HTML document 
			// and element's local name is "html" and element's namespace is the HTML
			// namespace"
			if (el === null || (
				el.nodeName === 'HTML' &&
				el.ownerDocument.documentElement instanceof HTMLElement &&
				el.namespaceURI === "http://www.w3.org/1999/xhtml"
			)) {

				// "let element be a new Element with "body" as its local name and the HTML 
				// namespace as its namespace.""
				el = doc.createElement('body');
			}

			// "If the node's document is an HTML document: Invoke the HTML fragment
			// parsing algorithm."
			// "If the node's document is an XML document: Invoke the XML fragment parsing 
			// algorithm."
			// "In either case, the algorithm must be invoked with fragment as the input
			// and element as the context element."
			context = el.cloneNode();
			context.innerHTML = html;

			// "If this raises an exception, then abort these steps. Otherwise, let new 
			// children be the nodes returned."

			// "Let fragment be a new DocumentFragment."
			fragment = doc.createDocumentFragment();

			// "Append all new children to fragment."
			while ((child = context.firstChild)) {
				fragment.appendChild(child);
			}

			// "Return fragment."
			return fragment;
		};

	}
}());
