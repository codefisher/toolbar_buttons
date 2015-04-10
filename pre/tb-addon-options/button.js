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
				menuItem.classList.add(className);
			  	menuItem.setAttribute("label", addon.name + " " + addon.version);
			  	menuItem.setAttribute("image", addon.iconURL);
				menuItem.addEventListener("command", toolbar_buttons.extensionOptionsOpen(addon), false);
				aMenu.appendChild(menuItem);
			}
		}
	});
}
