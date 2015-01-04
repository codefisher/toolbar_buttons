renameTabBlank: function() {
	var thisTab = window.getBrowser().selectedTab;
	thisTab.label = "";
	thisTab.removeAttribute("image");
}