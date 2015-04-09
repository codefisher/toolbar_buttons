populateUndoSubmenu: function(undoPopup) {
	var win = undoPopup.ownerDocument.defaultView;
	while (undoPopup.hasChildNodes()) {
		undoPopup.removeChild(undoPopup.firstChild);
	}
	let tabsFragment = win.RecentlyClosedTabsAndWindowsMenuUtils.getTabsFragment(win, "menuitem");
	undoPopup.appendChild(tabsFragment);
}