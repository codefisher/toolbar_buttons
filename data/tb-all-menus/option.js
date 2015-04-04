loadMenuSettings: function() {
	var obj = {};
	var prefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
	var children = prefs.getChildList("all-menus._menus.", obj);
	var stringBundle = toolbar_buttons.interfaces.StringBundleService
		.createBundle("chrome://{{chrome_name}}/locale/{{locale_file_prefix}}button.properties");
	var tabs = document.getElementById('all-menus-tabs');
	var panels = document.getElementById('all-menus-panels');
	if(obj.value == 1) {
		tabs.setAttribute('hidden', 'true');
	}
	var counted = 0;
	for(var i = 0; i < obj.value; i++) {
		var prefName = children[i].replace('all-menus._menus.', '');
		var tabLabel = null;
		if(prefName == 'browser.main-menubar' || prefName == 'navigator.main-menubar') {
			tabLabel = stringBundle.GetStringFromName("tb-all-menus.browser.main-menubar");
		} else if (prefName == 'messenger.mail-menubar') {
			tabLabel = stringBundle.GetStringFromName("tb-all-menus.messenger.mail-menubar");
		} else if (prefName == 'messengercompose.mail-menubar') {
			tabLabel = stringBundle.GetStringFromName("tb-all-menus.messengercompose.mail-menubar");
		} else if (prefName == 'messageWindow.mail-menubar') {
			tabLabel = stringBundle.GetStringFromName("tb-all-menus.messageWindow.mail-menubar");
		}  else {
			continue;
		}
		var tab = document.createElement('tab');
		if(counted == 0) {
			tab.setAttribute('selected', true);
		}
		tab.setAttribute('label', tabLabel);
		tabs.appendChild(tab);
		var panel = document.createElement('tabpanel');
		var listbox = document.createElement('richlistbox');
		listbox.setAttribute('flex', 1);
		
		var listcols = document.createElement('listcols');
		var firstCol = document.createElement('listcol');
		firstCol.setAttribute('flex', 1);
		listcols.appendChild(firstCol);
		listcols.appendChild(document.createElement('listcol'));
		listcols.appendChild(document.createElement('listcol'));
		listbox.appendChild(listcols);
		
		var count = {};
		var rows = prefs.getChildList("all-menus." + prefName + '.label.', count);
		for(var j = 0; j < count.value; j++) {
			var menuPrefName = rows[j].replace("all-menus." + prefName + '.label.', '');
			
			var label = prefs.getCharPref(rows[j]);
			var show = prefs.getBoolPref("all-menus." + prefName + '.in-menu.' + menuPrefName);
			var collapsed = prefs.getBoolPref("all-menus." + prefName + '.collapsed.' + menuPrefName);
			var row = document.createElement('richlistitem');
			
			var cellLabel = document.createElement('label');
			cellLabel.setAttribute('value', label);
			cellLabel.setAttribute('flex', 1);
			row.appendChild(cellLabel);

			var cellShow = document.createElement('checkbox');
			cellShow.setAttribute('label', stringBundle.GetStringFromName("tb-all-menus.option.show"));
			cellShow.setAttribute('checked', show);
			cellShow.setAttribute('pref', "all-menus." + prefName + '.in-menu.' + menuPrefName);
			cellShow.addEventListener('command', function(event) {
				var cell = event.target;
				prefs.setBoolPref(cell.getAttribute('pref'), cell.getAttribute('checked') == 'true');
			}, false);
			row.appendChild(cellShow);
			
			var cellCollapsed = document.createElement('checkbox');
			cellCollapsed.setAttribute('label', stringBundle.GetStringFromName("tb-all-menus.option.menubar"));
			cellCollapsed.setAttribute('checked', !collapsed);
			cellCollapsed.setAttribute('pref', "all-menus." + prefName + '.collapsed.' + menuPrefName);
			cellCollapsed.addEventListener('command', function(event) {
				var cell = event.target;
				prefs.setBoolPref(cell.getAttribute('pref'), cell.getAttribute('checked') != 'true');
			}, false);
			row.appendChild(cellCollapsed);
			
			listbox.appendChild(row);
		}
		
		panel.appendChild(listbox);
		panels.appendChild(panel);
		if(counted == 0) {
			tab.focus();
		}
		counted++;
	}
}

toolbar_buttons.loadMenuSettings();