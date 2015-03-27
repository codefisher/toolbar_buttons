loadAllMenusMenu: function(item, event) {
	if(item.id != 'tb-all-menus-popup') {
		return;
	}
	while(item.firstChild) {
		item.removeChild(item.firstChild);
	}
	var fileName = document.location.href.match(/([a-zA-Z]+).xul$/)[1];
	var menubar = document.getElementById('main-menubar') || document.getElementById('mail-menubar');
	if(!menubar) {
		return;
	}
	var toolbar = document.getElementById('toolbar-menubar') || document.getElementById('mail-toolbar-menubar2') || document.getElementById('compose-toolbar-menubar2');
	var prefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
	var showIcons = prefs.getBoolPref('all-menus.icons');
	item.parentNode.setAttribute('show_icons', showIcons);
	for (var i = 0; i < menubar.childNodes.length; i++) {
		var menuId = menubar.childNodes[i].id;
		var inMenuPref = 'all-menus.' + fileName + '.' + menubar.id +'.in-menu.' + menuId;
		if(prefs.getPrefType(inMenuPref)) {
			if(prefs.getBoolPref(inMenuPref)) {
				toolbar_buttons.allMenusAddItem(menubar.childNodes[i], item, showIcons);
			}
		} else {
			toolbar_buttons.allMenusAddItem(menubar.childNodes[i], item, showIcons);
		}
	}
	var stringBundle = toolbar_buttons.interfaces.StringBundleService
		.createBundle("chrome://{{chrome_name}}/locale/{{locale_file_prefix}}button.properties");
	if(prefs.getBoolPref('all-menus.settings')) {
		var menuseparator = document.createElement('menuseparator');
		item.appendChild(menuseparator);
		if(item.parentNode.parentNode != toolbar) {
			var menubarCheck = document.createElement('menuitem');
			menubarCheck.setAttribute("label", stringBundle.GetStringFromName("tb-all-menus.menubar"));
			var visibility = !(toolbar.getAttribute('autohide') == 'true' || toolbar.getAttribute('hidden') == 'true');
			menubarCheck.setAttribute("checked", visibility);
			menubarCheck.addEventListener("command", function(event) {
				try {
					CustomizableUI.setToolbarVisibility(toolbar.id, !visibility);
				} catch(e) {
					if(toolbar.hasAttribute('hidden')) {
						toolbar.setAttribute("hidden", visibility);
						toolbar.removeAttribute("autohide");
						document.persist(toolbar.id, "hidden");
						document.persist(toolbar.id, "autohide");
					} else {
						toolbar.setAttribute("autohide", visibility);
						document.persist(toolbar.id, "hidden");
					}
				}
			}, true);
			item.appendChild(menubarCheck);
		}
		var menubarSettings = document.createElement('menuitem');
		menubarSettings.setAttribute("label", stringBundle.GetStringFromName("tb-all-menus.settings"));
		menubarSettings.addEventListener("command", function(event) {
			var ary = Cc["@mozilla.org/supports-array;1"].createInstance(Ci.nsISupportsArray);
			var supportsStringPanel = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
			supportsStringPanel.data = "prefpane-tb-all-menus-tooltip";
			ary.AppendElement(supportsStringPanel);
			var ww = Cc["@mozilla.org/embedcomp/window-watcher;1"].getService(Ci.nsIWindowWatcher);
			var win = ww.openWindow(window, "chrome://{{chrome_name}}/content/options.xul", "", "chrome,centerscreen,toolbar", ary);
		}, true);
		item.appendChild(menubarSettings);
	}
}

allMenusAddItem: function(menu, item, showIcons) {
	var node = menu.cloneNode(true);
	node.setAttribute('hidden', false);
	node.classList.add('menu-iconic');
	node.classList.add('menuitem-iconic');
	item.appendChild(node);
}

allMenusStartUp: function() {	
	var menubar = document.getElementById('main-menubar') || document.getElementById('mail-menubar');
	var fileName = document.location.href.match(/([a-zA-Z]+).xul$/)[1];
	if(!menubar) {
		return;
	}
	var toolbar = document.getElementById('toolbar-menubar') || document.getElementById('mail-toolbar-menubar2') || document.getElementById('compose-toolbar-menubar2');
	var prefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
	var prefsBranch = toolbar_buttons.interfaces.PrefBranch;
	prefs.setBoolPref('all-menus._menus.'+ fileName + '.' + menubar.id, menubar.collapsed);

	/* if(!toolbar.getAttribute('toolbarname') && toolbar.getAttribute('grippytooltiptext')) {
		toolbar.setAttribute('toolbarname', toolbar.getAttribute('grippytooltiptext'));
	} */
	for (var i = 0; i < menubar.childNodes.length; i++) {
		var label = menubar.childNodes[i].getAttribute('label');
		var menuId = menubar.childNodes[i].id;
		if(!label || !menuId) {
			continue;
		}
		prefs.setCharPref('all-menus.'+ fileName + '.' + menubar.id +'.label.' + menuId, label);
		var collapsedPref = 'all-menus.'+ fileName + '.' + menubar.id +'.collapsed.' + menuId;
		if(prefs.getPrefType(collapsedPref)) {
			menubar.childNodes[i].setAttribute('hidden', prefs.getBoolPref(collapsedPref));
		} else {
			prefs.setBoolPref(collapsedPref, false);
		}
		var inMenuPref = 'all-menus.' + fileName + '.' + menubar.id +'.in-menu.' + menuId;
		if(!prefs.getPrefType(inMenuPref)) {
			prefs.setBoolPref(inMenuPref, true);
		}
	}	
	var hiddenWatcher = new toolbar_buttons.settingWatcher(prefs.root + 'all-menus.'+ fileName + '.' + menubar.id +'.collapsed.', function(subject, topic, data) {
		document.getElementById(data).setAttribute('hidden', prefsBranch.getBoolPref(subject.root + data));
	});
	hiddenWatcher.startup();
}

toolbar_buttons.allMenusStartUp();
