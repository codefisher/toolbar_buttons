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
		var tree = document.createElement('tree');
		tree.setAttribute('flex', 1);
		tree.setAttribute('style', 'min-height:200px;');
		tree.setAttribute('editable', true);
		var treecols = document.createElement('treecols');
		var treecolName = document.createElement('treecol');
		treecolName.setAttribute('flex', 1);
		treecolName.setAttribute('id', 'menu');
		treecolName.setAttribute('label', stringBundle.GetStringFromName("tb-all-menus.option.menu"));
		treecolName.setAttribute('editable', false);
		treecols.appendChild(treecolName);
		var spliter1 = document.createElement('splitter');
		spliter1.classList.add('tree-splitter');
		treecols.appendChild(spliter1);

		var treecolMenubar = document.createElement('treecol');
		treecolMenubar.setAttribute('id', 'menubar');
		treecolMenubar.setAttribute('label', stringBundle.GetStringFromName("tb-all-menus.option.menubar"));
		treecolMenubar.setAttribute('editable', true);
		treecolMenubar.setAttribute('type', 'checkbox');
		treecols.appendChild(treecolMenubar);
		var spliter2 = document.createElement('splitter');
		spliter2.classList.add('tree-splitter');
		treecols.appendChild(spliter2);

		var treecolShow = document.createElement('treecol');
		treecolShow.setAttribute('id', 'show');
		treecolShow.setAttribute('label', stringBundle.GetStringFromName("tb-all-menus.option.show"));
		treecolShow.setAttribute('editable', true);
		treecolShow.setAttribute('type', 'checkbox');
		treecols.appendChild(treecolShow);
		tree.appendChild(treecols);

		var treechildren = document.createElement('treechildren');
		tree.appendChild(treechildren);

		panel.appendChild(tree);
		panels.appendChild(panel);
		if(counted == 0) {
			tab.focus();
		}
		tree.view = toolbar_buttons.allMenusTreeView(prefs, prefName);
		counted++;
	}
}

allMenusTreeView: function(prefs, prefName) {
	var gPrefView = [];
	var count = {};
	var rows = prefs.getChildList("all-menus." + prefName + '.label.', count);
	for(var j = 0; j < count.value; j++) {
		var menuPrefName = rows[j].replace("all-menus." + prefName + '.label.', '');
		var tableRow = {
			menuPrefName: menuPrefName,
			menu: prefs.getCharPref(rows[j]),
			show: prefs.getBoolPref("all-menus." + prefName + '.in-menu.' + menuPrefName),
			menubar: prefs.getBoolPref("all-menus." + prefName + '.visible.' + menuPrefName)
		};
		gPrefView.push(tableRow);
	}
	gPrefView.sort(function(a, b) {
		if(a['menu'] < b['menu']) return -1;
		if(a['menu'] > b['menu']) return 1;
		return 0;
	});
	return {
		get rowCount() {
			return gPrefView.length;
		},
		getCellText: function (index, col) {
			if (!(index in gPrefView)) {
				return "";
			}
			return gPrefView[index][col.id];
		},
		getCellValue: function (index, col) {
			if (!(index in gPrefView)) {
				return "";
			}
			return gPrefView[index][col.id];
		},
		getRowProperties: function (index) {
			return "";
		},
		getCellProperties: function (index, col) {
			return "";
		},
		getColumnProperties: function (col) {
			return "";
		},
		treebox: null,
		selection: null,
		isContainer: function (index) {
			return false;
		},
		isContainerOpen: function (index) {
			return false;
		},
		isContainerEmpty: function (index) {
			return false;
		},
		isSorted: function () {
			return true;
		},
		canDrop: function (index, orientation) {
			return false;
		},
		drop: function (row, orientation) {
		},
		setTree: function (out) {
			this.treebox = out;
		},
		getParentIndex: function (rowIndex) {
			return -1;
		},
		hasNextSibling: function (rowIndex, afterIndex) {
			return false;
		},
		getLevel: function (index) {
			return 1;
		},
		getImageSrc: function (row, col) {
			return "";
		},
		toggleOpenState: function (index) {
		},
		cycleHeader: function (col) {
			if(col.id == 'menu') {
				gPrefView.reverse();
			}
		},
		selectionChanged: function () {
		},
		cycleCell: function (row, col) {
		},
		isEditable: function (row, col) {
			return col.id != 'menu';
		},
		isSelectable: function (row, col) {
			return col.id != 'menu';
		},
		setCellValue: function (row, col, value) {
			if (!(row in gPrefView)) {
				return "";
			}
			var menuPrefName = gPrefView[row]['menuPrefName'];
			if(col.id == 'show') {
				prefs.setBoolPref("all-menus." + prefName + '.in-menu.' + menuPrefName, value == 'true');
			} else if(col.id == 'menubar') {
				prefs.setBoolPref("all-menus." + prefName + '.visible.' + menuPrefName, value == 'true');
			}
			gPrefView[row][col.id] = value;
		},
		setCellText: function (row, col, value) {
		},
		performAction: function (action) {
		},
		performActionOnRow: function (action, row) {
		},
		performActionOnCell: function (action, row, col) {
		},
		isSeparator: function (index) {
			return false;
		}
	};
}

window.addEventListener('load', function() {
	toolbar_buttons.loadMenuSettings();
}, false);