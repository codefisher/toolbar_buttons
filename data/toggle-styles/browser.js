disableStyle: function(event) {
	var win = event.target.ownerDocument.defaultView;
	var viewStyle = win.getMarkupDocumentViewer().authorStyleDisabled;
	try {
		if(viewStyle) {
			win.gPageStyleMenu.switchStyleSheet('');
		} else {
			win.gPageStyleMenu.disableStyle();
		}
	} catch(e) {
		// this works in SeaMonkey and older versions of Firefox
		win.setStyleDisabled(!viewStyle);
	}
}