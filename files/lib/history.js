populateUndoSubmenu: function(event, undoPopup) {
	var win = undoPopup.ownerDocument.defaultView;
	while (undoPopup.hasChildNodes()) {
		undoPopup.removeChild(undoPopup.firstChild);
	}
	var type = "menuitem";
	if(undoPopup.parentNode.getAttribute('cui-areatype') == 'menu-panel') {
		type = "toolbarbutton";
	}
	let tabsFragment = win.RecentlyClosedTabsAndWindowsMenuUtils.getTabsFragment(win, type);
	undoPopup.appendChild(tabsFragment);
}