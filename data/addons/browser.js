goOpenAddons: function(item, event) {
	var win = event.target.ownerDocument.defaultView;
	if(item.getAttribute('cui-areatype') == 'menu-panel') {
		event.preventDefault();
		event.stopPropagation();
		win.PanelUI.showSubView('addons-panel-view', item, CustomizableUI.AREA_PANEL);
		event.preventDefault();
	}
}