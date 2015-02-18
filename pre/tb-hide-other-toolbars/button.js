hideOtherToolbars: function() {
	var toolbars = toolbar_buttons.getHideableToolbars();
	if(window.gNavToolbox) {
		var toolbarBox = window.gNavToolbox;
	} else {
		var toolbarBox = document.getElementById('mail-toolbox');
	}
	var anyVisible = false;
	var bars = [];
	for(var i = 0; i < toolbars.length; i++) {
		if(!toolbars[i].collapsed) {
			anyVisible = true;
			toolbars[i].setAttribute('collapsed', 'true');
			bars.push(toolbars[i].id);
		}
	}
	if(bars.length) {
		toolbarBox.setAttribute('_collapsed_bars', bars.join());
		document.persist(toolbarBox.id, '_collapsed_bars');
	}
	if(!anyVisible) {
		var showToolbars = toolbarBox.getAttribute('_collapsed_bars');
		if(showToolbars.length) {
			var showToolbarsIds = showToolbars.split(",");
			for(var i = 0; i < showToolbarsIds.length; i++) {
				document.getElementById(showToolbarsIds[i]).setAttribute('collapsed', 'false');
			}
		} else {
			for(var i = 0; i < toolbars.length; i++) {
				toolbars[i].setAttribute('collapsed', 'false');
			}
		}
	}
}

getHideableToolbars: function() {
	// this is based on code from Firefox.
	if(window.gNavToolbox) {
		var toolbarBox = window.gNavToolbox;
	} else {
		var toolbarBox = document.getElementById('mail-toolbox');
	}
	let toolbarNodes = Array.slice(toolbarBox.childNodes);
	toolbarNodes = toolbarNodes.concat(toolbarBox.externalToolbars);
	toolbarNodes = toolbarNodes.filter(node => node.getAttribute("toolbarname")  && node.getAttribute("type") != "menubar");
	if (document.documentElement.getAttribute("shellshowingmenubar") == "true") {
		toolbarNodes = toolbarNodes.filter(node => node.id != "toolbar-menubar");
	}
	return toolbarNodes;
}
