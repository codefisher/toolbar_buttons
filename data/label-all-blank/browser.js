renameAllTabsBlank: function(event) {
	var win = event.target.ownerDocument.defaultView;
	var tabs = win.gBrowser.mTabContainer.childNodes;
	for (var i = 0; i < tabs.length; i++) {
		var tab = tabs[i];
		tab.label = "";
		tab.removeAttribute("image");
	}
}