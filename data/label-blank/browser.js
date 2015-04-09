renameTabBlank: function(event) {
	var win = event.target.ownerDocument.defaultView;
	var thisTab = win.getBrowser().selectedTab;
	thisTab.label = "";
	thisTab.removeAttribute("image");
}