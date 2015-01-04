populateUndoSubmenu: function(undoPopup) {
	while (undoPopup.hasChildNodes()) {
		undoPopup.removeChild(undoPopup.firstChild);
	}
	let tabsFragment = window.RecentlyClosedTabsAndWindowsMenuUtils.getTabsFragment(window, "menuitem");
	undoPopup.appendChild(tabsFragment);
}