populateUndoSubmenu: function(event, undoPopup) {
	while (undoPopup.hasChildNodes())
	  undoPopup.removeChild(undoPopup.firstChild);
	let tabsFragment = RecentlyClosedTabsAndWindowsMenuUtils.getTabsFragment(window, "menuitem");
	undoPopup.appendChild(tabsFragment);
}