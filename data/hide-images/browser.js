hideImages: function(event) {
	var win = event.target.ownerDocument.defaultView;
	var test = win._content.document.getElementById("__zapImg");
	if(test) {
		test.parentNode.removeChild(test);
	} else {
		var style = win._content.document.createElement("style");
		style.setAttribute("type", "text/css");
		style.setAttribute("id", "__zapImg");
		style.innerHTML = "img, embed, object { visibility: hidden !important; } "
						+ "html * { background-image: none !important; }";
		var head = win._content.document.getElementsByTagName("head")[0];
		head.appendChild(style);
	}
}