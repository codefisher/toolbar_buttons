extensionOptionsOpen: function(addon) {
	return function(event) {
		var ww = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
               .getService(Components.interfaces.nsIWindowWatcher);
		var win = ww.openWindow(window, addon.optionsURL,
		                        "", "chrome,centerscreen,toolbar", null);
		};
}

openExtensionMenu: function(aMenu, aType) {
	Cu.import("resource://gre/modules/AddonManager.jsm");
	var stringBundle = toolbar_buttons.interfaces.StringBundleService
		.createBundle("chrome://{{chrome_name}}/locale/{{locale_file_prefix}}button.properties");
	var sep = aMenu.lastChild;
	while(sep.nodeName != 'menuseparator') {
		sep = sep.previousSibling;
	}
	while(sep.previousSibling && sep.previousSibling.nodeName != 'menuseparator') {
		aMenu.removeChild(sep.previousSibling);
	}
	AddonManager.getAddonsByTypes([aType], function(addons){
		addons.sort(function(a, b) { return a.name > b.name; });
		for(var i in addons) {
			var addon = addons[i];
			if(addon.appDisabled) {
			  	var menuItem = document.createElement("menuitem");
			  	menuItem.setAttribute("label", addon.name + " " + addon.version);
			  	menuItem.setAttribute("disabled", true);
				aMenu.insertBefore(menuItem, sep);
			} else {
			  	var menuItem = document.createElement("menu");
			  	menuItem.setAttribute("label", addon.name + " " + addon.version);
			  	menuItem.setAttribute("image", addon.iconURL);
			  	menuItem.className = "menu-iconic";
			  	var menupopup = document.createElement("menupopup");
			  	menupopup.addEventListener("popupshowing", toolbar_buttons.openAddonControlMenu(menupopup, addon, stringBundle), false);
			  	menuItem.appendChild(menupopup);
				aMenu.insertBefore(menuItem, sep);
			}
		}
	});
}

openAddonControlMenu: function(menupopup, addon, stringBundle) {
	Cu.import("resource://gre/modules/AddonManager.jsm");
	return function(event) {
		while(menupopup.firstChild) {
			menupopup.removeChild(menupopup.firstChild);
		}						
	  	event.stopPropagation();
	  	if(addon.pendingOperations & AddonManager.PENDING_INSTALL) {
			var install = document.createElement("menuitem");
		  	install.setAttribute("label", stringBundle.GetStringFromName("extension-cancel-install"));
			install.addEventListener("command", function(event) { addon.install.cancel(); }, false);
		  	menupopup.appendChild(install);
	  		return;
	  	}
	  	
	  	var about = document.createElement("menuitem");
	  	about.setAttribute("label", stringBundle.GetStringFromName("extensions-about"));
		about.addEventListener("command", toolbar_buttons.openExtensionAbout(addon), false);
	  	menupopup.appendChild(about);

		if(addon.optionsURL) {
		  	var option = document.createElement("menuitem");
		  	option.setAttribute("label", stringBundle.GetStringFromName("extensions-preference"));
			option.addEventListener("command", toolbar_buttons.extensionOptionsOpen(addon), false);
			menupopup.appendChild(option);
		}
		
		if(addon.homepageURL) {
		  	var option = document.createElement("menuitem");
		  	option.setAttribute("label", stringBundle.GetStringFromName("extensions-homepage"));
			option.addEventListener("command", toolbar_buttons.extensionHomepageOpen(addon), false);
			menupopup.appendChild(option);
		}
		
		if(addon.pendingOperations & AddonManager.PENDING_UNINSTALL) {
		  	var remove = document.createElement("menu");
		  	remove.setAttribute("label", stringBundle.GetStringFromName("extensions-remove-restart"));
		  	var popup = document.createElement("menupopup");
		  	popup.addEventListener("popupshowing", toolbar_buttons.openAddonRemoveMenu(popup, addon, stringBundle), false);
		  	remove.appendChild(popup);
			menupopup.appendChild(remove);
		} else if(addon.permissions & AddonManager.PERM_CAN_UNINSTALL) {
		  	var remove = document.createElement("menuitem");
		  	remove.setAttribute("label", stringBundle.GetStringFromName("extensions-remove"));
			remove.addEventListener("command", function(event) { addon.uninstall(); }, false);
		  	menupopup.appendChild(remove);
		}
		
		if(addon.userDisabled) {
			if(addon.operationsRequiringRestart & AddonManager.OP_NEEDS_RESTART_DISABLE) {
			  	var enable = document.createElement("menu");
			  	enable.setAttribute("label", stringBundle.GetStringFromName("extensions-disable-restart"));
			  	var popup = document.createElement("menupopup");
			  	popup.addEventListener("popupshowing", toolbar_buttons.openAddonDisableMenu(popup, addon, stringBundle, addon.userDisabled), false);
			  	enable.appendChild(popup);
				menupopup.appendChild(enable);
			} else if(addon.permissions & AddonManager.PERM_CAN_ENABLE) {
			  	var enable = document.createElement("menuitem");
			  	enable.setAttribute("label", stringBundle.GetStringFromName("extensions-enable"));
				enable.addEventListener("command", toolbar_buttons.setExtensionDisabled(addon, false), false);
			  	menupopup.appendChild(enable);
			}
		} else {
			if(addon.operationsRequiringRestart & AddonManager.OP_NEEDS_RESTART_ENABLE) {
			  	var disable = document.createElement("menu");
			  	disable.setAttribute("label", stringBundle.GetStringFromName("extensions-enable-restart"));
			  	var popup = document.createElement("menupopup");
			  	popup.addEventListener("popupshowing", toolbar_buttons.openAddonDisableMenu(popup, addon, stringBundle, addon.userDisabled), false);
			  	disable.appendChild(popup);
				menupopup.appendChild(disable);
			} else if(addon.permissions & AddonManager.PERM_CAN_DISABLE) {
			  	var disable = document.createElement("menuitem");
			  	disable.setAttribute("label", stringBundle.GetStringFromName("extensions-disable"));
				disable.addEventListener("command", toolbar_buttons.setExtensionDisabled(addon, true), false);
			  	menupopup.appendChild(disable);
			}
		}
	};
}

extensionHomepageOpen: function(addon) {
	return function() {
		var url = addon.homepageURL;
		try {
			var browser = window.getBrowser();
			browser.selectedTab = browser.addTab(url);
		} catch(e) {
			var uri = toolbar_buttons.interfaces.IOService.newURI(url, null, null);
			toolbar_buttons.interfaces.ExternalProtocolService.loadUrl(uri);
		}
	};
}

openAddonDisableMenu: function(menupopup, addon, stringBundle, disabled) {
	return function(event) {
		while(menupopup.firstChild) {
			menupopup.removeChild(menupopup.firstChild);
		}
		var undo = document.createElement("menuitem");
		undo.setAttribute("label", stringBundle.GetStringFromName("extensions-undo"));
		undo.addEventListener("command", toolbar_buttons.setExtensionDisabled(addon, !disabled), false);
		menupopup.appendChild(undo);
		var restart = document.createElement("menuitem");
		restart.setAttribute("label", stringBundle.GetStringFromName("extensions-restart"));
		restart.addEventListener("command", function(event) { toolbar_buttons.restartMozilla(); }, false);
		menupopup.appendChild(restart);
		
		event.stopPropagation();
	};
}

openAddonRemoveMenu: function(menupopup, addon, stringBundle) {
	return function(event) {
		while(menupopup.firstChild) {
			menupopup.removeChild(menupopup.firstChild);
		}
		var undo = document.createElement("menuitem");
		undo.setAttribute("label", stringBundle.GetStringFromName("extensions-undo"));
		undo.addEventListener("command", function(event) { addon.cancelUninstall(); }, false);
		menupopup.appendChild(undo);
		var restart = document.createElement("menuitem");
		restart.setAttribute("label", stringBundle.GetStringFromName("extensions-restart"));
		restart.addEventListener("command", function(event) { toolbar_buttons.restartMozilla(); }, false);
		menupopup.appendChild(restart);
		
		event.stopPropagation();
	};
}

setExtensionDisabled: function(aAddon, disabled) {
	return function(event) {
		aAddon.userDisabled = disabled;
	};
}

openExtensionAbout: function(aAddon) {
	return function(event) {
		var aboutURL = aAddon.aboutURL;
		if (aboutURL) {
			window.openDialog(aboutURL, "", "chrome,centerscreen,modal", aAddon);
		} else {
			window.openDialog("chrome://mozapps/content/extensions/about.xul", "", "chrome,centerscreen,modal", aAddon);
		}
	};
}
