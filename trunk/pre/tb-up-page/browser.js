pageUp: function() {
	var up = new window.KeyboardEvent("keypress", {
		code: "PageUp",
		keyCode: 0x21,
		bubbles : true,
		cancelable : true,
	});
	window.gBrowser.contentDocument.dispatchEvent(up);
}