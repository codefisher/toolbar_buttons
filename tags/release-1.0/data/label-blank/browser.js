renameTabBlank: function() {
	var thisTab = getBrowser().selectedTab;
	thisTab.label = "";
	thisTab.removeAttribute("image");
}