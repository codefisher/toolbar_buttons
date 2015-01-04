disableStyle: function() {
	var viewStyle = window.getMarkupDocumentViewer().authorStyleDisabled;
	try {
		if(viewStyle) {
			window.gPageStyleMenu.switchStyleSheet('');		
		} else {
			window.gPageStyleMenu.disableStyle();
		}
	} catch(e) {
		// this works in SeaMonkey and older versions of Firefox
		window.setStyleDisabled(!viewStyle);
	}
}