renameAllTabsBlank: function() {
	var tabs = window.gBrowser.mTabContainer.childNodes;
	for (var i = 0; i < tabs.length; i++) {
		var tab = tabs[i];
		tab.label = "";
		tab.removeAttribute("image");
	}
}