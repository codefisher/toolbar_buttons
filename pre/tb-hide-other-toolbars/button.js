hideOtherToolbars: function(event) {
	var doc = event.target.ownerDocument;
	var win = doc.defaultView;
	var toolbars = toolbar_buttons.getHideableToolbars(event);
	if(win.gNavToolbox) {
		var toolbarBox = win.gNavToolbox;
	} else {
		var toolbarBox = doc.getElementById('mail-toolbox');
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
		doc.persist(toolbarBox.id, '_collapsed_bars');
	}
	if(!anyVisible) {
		var showToolbars = toolbarBox.getAttribute('_collapsed_bars');
		if(showToolbars.length) {
			var showToolbarsIds = showToolbars.split(",");
			for(var i = 0; i < showToolbarsIds.length; i++) {
				var toolbar = doc.getElementById(showToolbarsIds[i]);
				if(toolbar) {
					toolbar.setAttribute('collapsed', 'false');
				}
			}
		} else {
			for(var i = 0; i < toolbars.length; i++) {
				toolbars[i].setAttribute('collapsed', 'false');
			}
		}
	}
}

getHideableToolbars: function(event) {
	var doc = event.target.ownerDocument;
	var win = doc.defaultView;
	// this is based on code from Firefox.
	if(win.gNavToolbox) {
		var toolbarBox = win.gNavToolbox;
	} else {
		var toolbarBox = doc.getElementById('mail-toolbox');
	}
	let toolbarNodes = Array.slice(toolbarBox.childNodes);
	toolbarNodes = toolbarNodes.concat(toolbarBox.externalToolbars);
	toolbarNodes = toolbarNodes.filter(node => node.getAttribute("toolbarname")  && node.getAttribute("type") != "menubar");
	if (doc.documentElement.getAttribute("shellshowingmenubar") == "true") {
		toolbarNodes = toolbarNodes.filter(node => node.id != "toolbar-menubar");
	}
	return toolbarNodes;
}
