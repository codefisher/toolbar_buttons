pageDown: function() {
	var down = new window.KeyboardEvent("keypress", {
		code: "PageDown",
		keyCode: 0x22,
		bubbles : true,
		cancelable : true,
	});
	window.gBrowser.contentDocument.dispatchEvent(down);
}