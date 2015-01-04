hideImages: function() {
	var test = window._content.document.getElementById("__zapImg");
	if (test) {
		test.parentNode.removeChild(test);
	} else {
		var style = window._content.document.createElement("style");
		style.setAttribute("type", "text/css");
		style.setAttribute("id", "__zapImg");
		style.innerHTML = "img, embed, object { visibility: hidden !important; } "
						+ "html * { background-image: none !important; }";
		var head = window._content.document.getElementsByTagName("head")[0];
		head.appendChild(style);
	}
}