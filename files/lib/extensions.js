extensionOptionsOpen: function(addon) {
	return function(event) {
		var win = event.target.ownerDocument.defaultView;
		var ww = Cc["@mozilla.org/embedcomp/window-watcher;1"].getService(Ci.nsIWindowWatcher);
		ww.openWindow(win, addon.optionsURL, "", "chrome,centerscreen,toolbar", null);
	};
}

openExtensionMenu: function(aMenu, aType) {
	var doc = aMenu.ownerDocument;
	Cu.import("resource://gre/modules/AddonManager.jsm");
	var stringBundle = toolbar_buttons.interfaces.StringBundleService
		.createBundle("chrome://{{chrome_name}}/locale/{{locale_file_prefix}}button.properties");
	var sep = aMenu.lastChild;
	while(sep && sep.nodeName != 'menuseparator') {
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
				var menuItem = doc.createElement("menuitem");
				menuItem.setAttribute("label", addon.name + " " + addon.version);
				menuItem.setAttribute("disabled", true);
				aMenu.insertBefore(menuItem, sep);
			} else {
				var menuItem = doc.createElement("menu");
				menuItem.setAttribute("label", addon.name + " " + addon.version);
				menuItem.setAttribute("image", addon.iconURL);
				menuItem.className = "menu-iconic";
				var menupopup = doc.createElement("menupopup");
				menupopup.addEventListener("popupshowing", toolbar_buttons.openAddonControlMenu(menupopup, addon, stringBundle), false);
				menuItem.appendChild(menupopup);
				aMenu.insertBefore(menuItem, sep);
			}
		}
	});
}

openAddonControlMenu: function(menupopup, addon, stringBundle) {
	var doc = menupopup.ownerDocument;
	Cu.import("resource://gre/modules/AddonManager.jsm");
	return function(event) {
		while(menupopup.firstChild) {
			menupopup.removeChild(menupopup.firstChild);
		}
		event.stopPropagation();
		if(addon.pendingOperations & AddonManager.PENDING_INSTALL) {
			var install = doc.createElement("menuitem");
			install.setAttribute("label", stringBundle.GetStringFromName("extension-cancel-install"));
			install.addEventListener("command", function(event) { addon.install.cancel(); }, false);
			menupopup.appendChild(install);
			return;
		}
		
		var about = doc.createElement("menuitem");
		about.setAttribute("label", stringBundle.GetStringFromName("extensions-about"));
		about.addEventListener("command", toolbar_buttons.openExtensionAbout(addon), false);
		menupopup.appendChild(about);

		if(addon.optionsURL) {
			var option = doc.createElement("menuitem");
			option.setAttribute("label", stringBundle.GetStringFromName("extensions-preference"));
			option.addEventListener("command", toolbar_buttons.extensionOptionsOpen(addon), false);
			menupopup.appendChild(option);
		}
		
		if(addon.homepageURL) {
			var option = doc.createElement("menuitem");
			option.setAttribute("label", stringBundle.GetStringFromName("extensions-homepage"));
			option.addEventListener("command", toolbar_buttons.extensionHomepageOpen(addon), false);
			menupopup.appendChild(option);
		}
		
		if(addon.pendingOperations & AddonManager.PENDING_UNINSTALL) {
			var remove = doc.createElement("menu");
			remove.setAttribute("label", stringBundle.GetStringFromName("extensions-remove-restart"));
			var popup = doc.createElement("menupopup");
			popup.addEventListener("popupshowing", toolbar_buttons.openAddonRemoveMenu(popup, addon, stringBundle), false);
			remove.appendChild(popup);
			menupopup.appendChild(remove);
		} else if(addon.permissions & AddonManager.PERM_CAN_UNINSTALL) {
			var remove = doc.createElement("menuitem");
			remove.setAttribute("label", stringBundle.GetStringFromName("extensions-remove"));
			remove.addEventListener("command", function(event) { addon.uninstall(); }, false);
			menupopup.appendChild(remove);
		}
		
		if(addon.type == "plugin") {
			var seperator = doc.createElement("menuseparator");
			menupopup.appendChild(seperator);
			
			var enable = doc.createElement("menuitem");
			enable.setAttribute("label", stringBundle.GetStringFromName("extensions-always-activate"));
			enable.setAttribute("type", "radio");
			enable.setAttribute("name", "enable-disable");
			if(addon.userDisabled == false) {
				enable.setAttribute("checked", true);
			}
			enable.addEventListener("command", toolbar_buttons.setExtensionDisabled(addon, false), false);
			menupopup.appendChild(enable);
			
			var disable = doc.createElement("menuitem");
			disable.setAttribute("label", stringBundle.GetStringFromName("extensions-never-activate"));
			disable.setAttribute("type", "radio");
			disable.setAttribute("name", "enable-disable");
			if(addon.userDisabled == true) {
				enable.setAttribute("checked", true);
			}
			disable.addEventListener("command", toolbar_buttons.setExtensionDisabled(addon, true), false);
			menupopup.appendChild(disable);
		
			var ask = doc.createElement("menuitem");
			ask.setAttribute("label", stringBundle.GetStringFromName("extensions-ask-to-activate"));
			ask.setAttribute("type", "radio");
			ask.setAttribute("name", "enable-disable");
			if(addon.userDisabled == AddonManager.STATE_ASK_TO_ACTIVATE) {
				ask.setAttribute("checked", true);
			}
			ask.addEventListener("command", toolbar_buttons.setExtensionDisabled(addon, true), false);
			menupopup.appendChild(ask);
		} else {
			if(addon.userDisabled) {
				if(addon.operationsRequiringRestart & AddonManager.OP_NEEDS_RESTART_DISABLE) {
					var enable = doc.createElement("menu");
					enable.setAttribute("label", stringBundle.GetStringFromName("extensions-disable-restart"));
					var popup = doc.createElement("menupopup");
					popup.addEventListener("popupshowing", toolbar_buttons.openAddonDisableMenu(popup, addon, stringBundle, addon.userDisabled), false);
					enable.appendChild(popup);
					menupopup.appendChild(enable);
				} else if(addon.permissions & AddonManager.PERM_CAN_ENABLE) {
					var enable = doc.createElement("menuitem");
					enable.setAttribute("label", stringBundle.GetStringFromName("extensions-enable"));
					enable.addEventListener("command", toolbar_buttons.setExtensionDisabled(addon, false), false);
					menupopup.appendChild(enable);
				}
			} else {
				if(addon.operationsRequiringRestart & AddonManager.OP_NEEDS_RESTART_ENABLE) {
					var disable = doc.createElement("menu");
					disable.setAttribute("label", stringBundle.GetStringFromName("extensions-enable-restart"));
					var popup = doc.createElement("menupopup");
					popup.addEventListener("popupshowing", toolbar_buttons.openAddonDisableMenu(popup, addon, stringBundle, addon.userDisabled), false);
					disable.appendChild(popup);
					menupopup.appendChild(disable);
				} else if(addon.permissions & AddonManager.PERM_CAN_DISABLE) {
					var disable = doc.createElement("menuitem");
					disable.setAttribute("label", doc.GetStringFromName("extensions-disable"));
					disable.addEventListener("command", toolbar_buttons.setExtensionDisabled(addon, true), false);
					menupopup.appendChild(disable);
				}
			}
		}
	};
}

extensionHomepageOpen: function(addon) {
	return function(event) {
		var win = event.target.ownerDocument.defaultView;
		var url = addon.homepageURL;
		try {
			var browser = win.getBrowser();
			browser.selectedTab = browser.addTab(url);
		} catch(e) {
			var uri = toolbar_buttons.interfaces.IOService.newURI(url, null, null);
			toolbar_buttons.interfaces.ExternalProtocolService.loadUrl(uri);
		}
	};
}

openAddonDisableMenu: function(menupopup, addon, stringBundle, disabled) {
	return function(event) {
		var doc = event.target.ownerDocument;
		while(menupopup.firstChild) {
			menupopup.removeChild(menupopup.firstChild);
		}
		var undo = doc.createElement("menuitem");
		undo.setAttribute("label", stringBundle.GetStringFromName("extensions-undo"));
		undo.addEventListener("command", toolbar_buttons.setExtensionDisabled(addon, !disabled), false);
		menupopup.appendChild(undo);
		var restart = doc.createElement("menuitem");
		restart.setAttribute("label", stringBundle.GetStringFromName("extensions-restart"));
		restart.addEventListener("command", function(event) { toolbar_buttons.restartMozilla(); }, false);
		menupopup.appendChild(restart);
		
		event.stopPropagation();
	};
}

openAddonRemoveMenu: function(menupopup, addon, stringBundle) {
	return function(event) {
		var doc = event.target.ownerDocument;
		while(menupopup.firstChild) {
			menupopup.removeChild(menupopup.firstChild);
		}
		var undo = doc.createElement("menuitem");
		undo.setAttribute("label", stringBundle.GetStringFromName("extensions-undo"));
		undo.addEventListener("command", function(event) { addon.cancelUninstall(); }, false);
		menupopup.appendChild(undo);
		var restart = doc.createElement("menuitem");
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
		var win = event.target.ownerDocument.defaultView;
		var aboutURL = aAddon.aboutURL;
		if (aboutURL) {
			win.openDialog(aboutURL, "", "chrome,centerscreen,modal", aAddon);
		} else {
			win.openDialog("chrome://mozapps/content/extensions/about.xul", "", "chrome,centerscreen,modal", aAddon);
		}
	};
}
