pageDown: function(event) {
	var win = event.target.ownerDocument.defaultView;
	var down = new win.KeyboardEvent("keypress", {
		code: "PageDown",
		keyCode: 0x22,
		bubbles : true,
		cancelable : true,
	});
	win.gBrowser.contentDocument.dispatchEvent(down);
}