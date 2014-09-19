disableStyle: function() {
	var viewStyle = getMarkupDocumentViewer().authorStyleDisabled;
	if(viewStyle) {
		gPageStyleMenu.switchStyleSheet('');		
	} else {
		gPageStyleMenu.disableStyle();
	}
}