openExtensionOptionsMenu: function(item, event) {
	if(event.target != event.currentTarget || event.button != 0) {
		return;
	}
	if(item.getAttribute('cui-areatype') == 'menu-panel') {
		var win = item.ownerDocument.defaultView;
		event.preventDefault();
		event.stopPropagation();
		var panel = item.ownerDocument.getElementById('tb-addon-options-panel-view');
		toolbar_buttons.extensionOptionsMenu(panel);
		win.PanelUI.showSubView('tb-addon-options-panel-view', item, CustomizableUI.AREA_PANEL);
	} else {
		event.target.firstChild.openPopup(event.target, "after_start");
	}
}

extensionOptionsMenu: function(aMenu) {
	var doc = aMenu.ownerDocument;
	Cu.import("resource://gre/modules/AddonManager.jsm");
	while(aMenu.firstChild) {
		aMenu.removeChild(aMenu.firstChild);
	}
	if(aMenu.tagName == 'panelview') {
		// these lines take care working well with the Panel
		var itemType = 'toolbarbutton';
		aMenu.classList.add('mozbutton-panelview')
		var vbox = doc.createElement('vbox');
		aMenu.appendChild(vbox);
		aMenu = vbox;
		var className = 'subviewbutton';
	} else {
		var itemType = 'menuitem';
		var className = '';
	}
	AddonManager.getAddonsByTypes(["extension"], function(addons){
		addons.sort(function(a, b) { return a.name > b.name; });
		for(var i in addons) {
			var addon = addons[i];
			if(addon.optionsURL) {
			  	var menuItem = doc.createElement(itemType);
				if(className) {
					menuItem.classList.add(className);
				}
			  	menuItem.setAttribute("label", addon.name + " " + addon.version);
			  	menuItem.setAttribute("image", addon.iconURL);
				menuItem.addEventListener("command", toolbar_buttons.extensionOptionsOpen(addon), false);
				aMenu.appendChild(menuItem);
			}
		}
	});
}
