loadAllMenusMenu: function(item, event) {
	var doc = event.target.ownerDocument;
	var win = doc.defaultView;
	if(event.target != event.currentTarget || item.parentNode.getAttribute('cui-areatype') == 'menu-panel') {
		return;
	}
	while(item.firstChild) {
		item.removeChild(item.firstChild);
	}
	var fileName = doc.location.href.match(/([a-zA-Z]+).xul$/)[1];
	var menubar = doc.getElementById('main-menubar') || doc.getElementById('mail-menubar');
	if(!menubar) {
		return;
	}
	var isPanel = (item.nodeName == 'panelview');
	var toolbar = doc.getElementById('toolbar-menubar') || doc.getElementById('mail-toolbar-menubar2') || doc.getElementById('compose-toolbar-menubar2');
	var prefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
	var showIcons = prefs.getBoolPref('all-menus.icons');
	item.parentNode.setAttribute('show_icons', showIcons);
	for (var i = 0; i < menubar.childNodes.length; i++) {
		var menuId = menubar.childNodes[i].id;
		var inMenuPref = 'all-menus.' + fileName + '.' + menubar.id +'.in-menu.' + menuId;
		if(prefs.getPrefType(inMenuPref)) {
			if(prefs.getBoolPref(inMenuPref)) {
				toolbar_buttons.allMenusAddItem(menubar.childNodes[i], item, showIcons, isPanel);
			}
		} else {
			toolbar_buttons.allMenusAddItem(menubar.childNodes[i], item, showIcons, isPanel);
		}
	}
	var stringBundle = toolbar_buttons.interfaces.StringBundleService
		.createBundle("chrome://{{chrome_name}}/locale/{{locale_file_prefix}}button.properties");
	if(prefs.getBoolPref('all-menus.settings')) {
		var menuseparator = doc.createElement('menuseparator');
		item.appendChild(menuseparator);
		if(item.parentNode.parentNode != toolbar) {
			var menubarCheck = doc.createElement('menuitem');
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
						doc.persist(toolbar.id, "hidden");
						doc.persist(toolbar.id, "autohide");
					} else {
						toolbar.setAttribute("autohide", visibility);
						doc.persist(toolbar.id, "hidden");
					}
				}
			}, true);
			item.appendChild(menubarCheck);
		}
		var menubarSettings = doc.createElement('menuitem');
		menubarSettings.setAttribute("label", stringBundle.GetStringFromName("tb-all-menus.settings"));
		menubarSettings.addEventListener("command", function(event) {
			var ary = Cc["@mozilla.org/supports-array;1"].createInstance(Ci.nsISupportsArray);
			var supportsStringPanel = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
			supportsStringPanel.data = "prefpane-tb-all-menus-tooltip";
			ary.AppendElement(supportsStringPanel);
			var ww = Cc["@mozilla.org/embedcomp/window-watcher;1"].getService(Ci.nsIWindowWatcher);
			ww.openWindow(win, "chrome://{{chrome_name}}/content/options.xul", "", "chrome,centerscreen,toolbar", ary);
		}, true);
		item.appendChild(menubarSettings);
	}
}

allMenuOpen: function(item, event) {
	if(event.target != event.currentTarget) {
		return;
	}
	if(item.getAttribute('cui-areatype') == 'menu-panel') {
		var win = item.ownerDocument.defaultView;
		event.preventDefault();
		event.stopPropagation();
		win.PanelUI.showSubView('tb-all-menus-panel-view', item, CustomizableUI.AREA_PANEL);
		var panel = item.ownerDocument.getElementById('tb-all-menus-panel-view');
		toolbar_buttons.loadAllMenusMenu(panel, event);
	}
}

allMenusAddItem: function(menu, item, showIcons, isPanel) {
	if(!menu.firstChild) {
		return;
	}
	var node = menu.cloneNode(false);
	node.setAttribute('hidden', false);
	if(showIcons) {
		node.classList.add('menu-iconic');
		node.classList.add('menuitem-iconic');
	}
	item.appendChild(node);
	node.cloneTarget = menu;
	node.id = node.id + '-panel';
	if(menu.firstChild) {
		if(isPanel) {
			node.addEventListener('click', function(event) {
				toolbar_buttons.showAMenu(event, menu.id);
			}, false);
		} else {
			node.appendChild(menu.firstChild);
		}
	}
	menu.style.visibility = 'visible';
}

showAMenuAsPanel: function(aEvent, aMenu) {
	var doc = aEvent.target.ownerDocument;
	var win = doc.defaultView;
	if(!aMenu.firstChild) {
		return;
	}
	var popup = aMenu.firstChild;
	/* what we do is move the popup to our self, and then when finished move it
	 * back again, this is better then cloning because we get all event Listeners too
	 */
	popup.addEventListener('popuphidden', function showAMenuPopupHidding(event) {
		if(event.originalTarget == popup) {
			aEvent.target.removeEventListener('popuphidden', showAMenuPopupHidding, false);
			popup.setAttribute('style', '');
			aMenu.appendChild(popup);
		}
	}, false);
	doc.getElementById('PanelUI-multiView').appendChild(popup);
	aMenu.style.visibility = 'visible';
	popup.setAttribute('style', '-moz-binding: url("chrome://browser/content/customizableui/panelUI.xml#panelview");');
	win.PanelUI.showSubView(popup.id, aEvent.target, CustomizableUI.AREA_PANEL);
}

allMenusReturnPopups: function(item, event) {
	if(event.target != event.currentTarget) {
		return;
	}
	var nodes = item.childNodes;
	for(var i = 0; i < nodes.length; i++) {
		if(nodes[i].cloneTarget && nodes[i].firstChild) {
			nodes[i].cloneTarget.appendChild(nodes[i].firstChild);
		}
	}
}

allMenusStartUp: function(doc) {
	var menubar = doc.getElementById('main-menubar') || doc.getElementById('mail-menubar');
	var fileName = doc.location.href.match(/([a-zA-Z]+).xul$/)[1];
	if(!menubar) {
		return;
	}
	var toolbar = doc.getElementById('toolbar-menubar') || doc.getElementById('mail-toolbar-menubar2') || doc.getElementById('compose-toolbar-menubar2');
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
		var visiblePref = 'all-menus.'+ fileName + '.' + menubar.id +'.visible.' + menuId;
		if(prefs.getPrefType(visiblePref)) {
			menubar.childNodes[i].setAttribute('hidden', !prefs.getBoolPref(visiblePref));
		} else {
			prefs.setBoolPref(visiblePref, true);
		}
		var inMenuPref = 'all-menus.' + fileName + '.' + menubar.id +'.in-menu.' + menuId;
		if(!prefs.getPrefType(inMenuPref)) {
			prefs.setBoolPref(inMenuPref, true);
		}
	}	
	var hiddenWatcher = new toolbar_buttons.settingWatcher(prefs.root + 'all-menus.'+ fileName + '.' + menubar.id +'.visible.', function(subject, topic, data) {
		doc.getElementById(data).setAttribute('hidden', !prefsBranch.getBoolPref(subject.root + data));
	});
	hiddenWatcher.startup();
	toolbar_buttons.registerCleanUpFunction(function() {
		for (var i = 0; i < menubar.childNodes.length; i++) {
			menubar.childNodes[i].setAttribute('hidden', false);
		}
		hiddenWatcher.shutdown();
	});
}

toolbar_buttons.allMenusStartUp(document);
