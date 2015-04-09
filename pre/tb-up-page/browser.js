pageUp: function(event) {
	var win = event.target.ownerDocument.defaultView;
	var up = new win.KeyboardEvent("keypress", {
		code: "PageUp",
		keyCode: 0x21,
		bubbles : true,
		cancelable : true,
	});
	win.gBrowser.contentDocument.dispatchEvent(up);
}