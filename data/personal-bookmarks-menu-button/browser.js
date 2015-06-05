personalBookmarksMenuButton: function(item, event) {
	var win = item.ownerDocument.defaultView;
	if (event.target == event.currentTarget) {
		new win.PlacesMenu(event, 'place:folder=TOOLBAR');
	}
}

personalBookmarksMenu: function(item, event) {
	if(item.getAttribute('cui-areatype') == 'menu-panel') {
		var win = item.ownerDocument.defaultView;
		event.preventDefault();
		event.stopPropagation();
		win.PanelUI.showSubView('personal-bookmarks-menu-button-panel-view', item, CustomizableUI.AREA_PANEL);
		var panel = item.ownerDocument.getElementById('personal-bookmarks-menu-button-panel-view')
		var obj = {
			target: panel,
			originalTarget: panel,
			preventDefault: function() {
				event.preventDefault();
			}
		};
		new win.PlacesMenu(obj, 'place:folder=TOOLBAR');
	} else {
		event.target.firstChild.openPopup(event.target, "after_start");
	}
}