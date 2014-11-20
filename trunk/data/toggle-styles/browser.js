disableStyle: function() {
	var viewStyle = getMarkupDocumentViewer().authorStyleDisabled;
	try {
		if(viewStyle) {
			gPageStyleMenu.switchStyleSheet('');		
		} else {
			gPageStyleMenu.disableStyle();
		}
	} catch(e) {
		// this works in SeaMonkey and older versions of Firefox
		setStyleDisabled(!viewStyle);
	}
}