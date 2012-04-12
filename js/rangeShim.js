(function () {
    if (window.Range && Range.prototype && typeof Range.prototype.createContextualFragment == "undefined") {
        Range.prototype.createContextualFragment = function(html) {
            var startNode = this.startContainer;
            var doc = startNode.nodeType = 9 ? startNode : startNode.ownerDocument;
            var container = doc.createElement("div");
            container.innerHTML = html;
            var frag = doc.createDocumentFragment(), n;
            while ( (n = container.firstChild) ) {
                frag.appendChild(n);
            }
            return frag;
        };
    }
}());
