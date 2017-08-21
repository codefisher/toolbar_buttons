webDeveloperOpener: function(event) {
	if(event.target != event.currentTarget || ('button' in event && event.button != 0)) {
		return;
	}
	var item = event.target;
	if(item.getAttribute('cui-areatype') == 'menu-panel') {
		var win = item.ownerDocument.defaultView;
		event.preventDefault();
		event.stopPropagation();
		win.PanelUI.showSubView('PanelUI-developer', item, CustomizableUI.AREA_PANEL);
	}
}
