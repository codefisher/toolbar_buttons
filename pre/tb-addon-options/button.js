extensionOptionsMenu: function(aMenu) {
	var doc = aMenu.ownerDocument;
	Cu.import("resource://gre/modules/AddonManager.jsm");
	while(aMenu.firstChild) {
		aMenu.removeChild(aMenu.firstChild);
	}
	AddonManager.getAddonsByTypes(["extension"], function(addons){
		addons.sort(function(a, b) { return a.name > b.name; });
		for(var i in addons) {
			var addon = addons[i];
			if(addon.optionsURL) {
			  	var menuItem = doc.createElement("menuitem");
			  	menuItem.setAttribute("label", addon.name + " " + addon.version);
			  	menuItem.setAttribute("image", addon.iconURL);
				menuItem.addEventListener("command", toolbar_buttons.extensionOptionsOpen(addon), false);
				aMenu.appendChild(menuItem);
			}
		}
	});
}
