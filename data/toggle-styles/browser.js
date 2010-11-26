disableStyle: function() {
	var viewStyle = getMarkupDocumentViewer().authorStyleDisabled;
	if (viewStyle)
		setStyleDisabled(false);
	else
		setStyleDisabled(true);
}