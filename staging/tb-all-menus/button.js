loadAllMenusMenu: function(item, event) {
	if(item.id != 'tb-all-menus-popup') {
		return;
	}
	while(item.firstChild) {
		item.removeChild(item.firstChild);
	}
	var menubar = document.getElementById('main-menubar') || document.getElementById('mail-menubar');
	if(!menubar) {
		return;
	}
	var prefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
	for (var i = 0; i < menubar.childNodes.length; i++) {
		var menuId = menubar.childNodes[i].id;
		var inMenuPref = 'all-menus.' + menubar.id +'.in-menu.' + menuId;
		if(prefs.getPrefType(inMenuPref)) {
			if(prefs.getBoolPref(inMenuPref)) {
				var node = menubar.childNodes[i].cloneNode(true);
				node.setAttribute('hidden', false);
				item.appendChild(node);
			}
		} else {
			var node = menubar.childNodes[i].cloneNode(true);
			node.setAttribute('hidden', false);
			item.appendChild(node);
		}
	}

}

allMenusStartUp: function() {	
	var menubar = document.getElementById('main-menubar') || document.getElementById('mail-menubar');
	if(!menubar) {
		return;
	}
	var toolbar = document.getElementById('toolbar-menubar') || document.getElementById('mail-toolbar-menubar2');
	var prefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
	var prefsBranch = toolbar_buttons.interfaces.PrefBranch;
	prefs.setBoolPref('all-menus._menus.' + menubar.id, menubar.collapsed);
	for (var i = 0; i < menubar.childNodes.length; i++) {
		var label = menubar.childNodes[i].getAttribute('label');
		var menuId = menubar.childNodes[i].id;
		prefs.setCharPref('all-menus.' + menubar.id +'.label.' + menuId, label);
		var collapsedPref = 'all-menus.' + menubar.id +'.collapsed.' + menuId;
		if(prefs.getPrefType(collapsedPref)) {
			menubar.childNodes[i].setAttribute('hidden', prefs.getBoolPref(collapsedPref));
		} else {
			prefs.setBoolPref(collapsedPref, false);
		}
		var inMenuPref = 'all-menus.' + menubar.id +'.in-menu.' + menuId;
		if(!prefs.getPrefType(inMenuPref)) {
			prefs.setBoolPref(inMenuPref, true);
		}
	}
	
	var mutationObserver = new window.MutationObserver(function(mutations) {
		var attribute = false;
		for(var mut in mutations) {
			attribute = attribute || (mut.type == "attributes");
		}
		if(!mut) return;
		var attributeName = false;
		for(var attr in mutations) {
			attributeName = attributeName || (attr.attributeName != "autohide");
		}
		if(!attributeName) return;
		prefs.setBoolPref('all-menus._menus.' + menubar.id, toolbar.getAttribute('autohide') == 'true');
	});
	mutationObserver.observe(toolbar, { attributes: true, subtree: false });
	var collaspedWatcher = new toolbar_buttons.settingWatcher(prefs.root + 'all-menus._menus.' + menubar.id, function(subject, topic, data) {
		var val = prefsBranch.getBoolPref(subject.root);
		toolbar.setAttribute('autohide', val);
	});
	collaspedWatcher.startup();
	var hiddenWatcher = new toolbar_buttons.settingWatcher(prefs.root + 'all-menus.' + menubar.id +'.collapsed.', function(subject, topic, data) {
		document.getElementById(data).setAttribute('hidden', prefsBranch.getBoolPref(subject.root + data));
	});
	hiddenWatcher.startup();
}

toolbar_buttons.allMenusStartUp();
