getTogglableToolbars: function(event) {
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
	toolbarNodes = toolbarNodes.filter(node => node.getAttribute("toolbarname") || node.getAttribute("aria-label"));
	if (doc.documentElement.getAttribute("shellshowingmenubar") == "true") {
		toolbarNodes = toolbarNodes.filter(node => node.id != "toolbar-menubar");
	}
	return toolbarNodes;
}

loadToolbarDisplayMenu: function(event, popup) {
	var doc = event.target.ownerDocument;
	var win = doc.defaultView;
	if (popup != event.currentTarget)
		return;
	while(popup.firstChild) {
		popup.removeChild(popup.firstChild);
	}
	let toolbarNodes = toolbar_buttons.getTogglableToolbars(event);
	
	var stringBundle = toolbar_buttons.interfaces.StringBundleService
				.createBundle("chrome://{{chrome_name}}/locale/{{locale_file_prefix}}button.properties");
				
	for (let toolbar of toolbarNodes) {
		let menuItem = doc.createElement("menu");
		var label = toolbar.getAttribute("toolbarname");
		if(!label) {
			label = toolbar.getAttribute("aria-label");
		}
		menuItem.setAttribute("label", label);
		let menupopup = doc.createElement("menupopup");
		menupopup.setAttribute('toolbarid', toolbar.id);
		menupopup.addEventListener('popupshowing', function(event) {
			var submenu = event.currentTarget;
			event.stopPropagation();
			if(submenu._generated) {
				return;
			}
			var toolbarId = submenu.getAttribute('toolbarid');
			var toolbar = doc.getElementById(toolbarId);

			let smallIcons = doc.createElement("menuitem");
			smallIcons.setAttribute('type', 'radio');
			smallIcons.setAttribute('name', 'icons');
			if(toolbar.getAttribute('iconsize') == 'small') {
				smallIcons.setAttribute('checked', true);
			}
			smallIcons.setAttribute('label', stringBundle.GetStringFromName("tb-toolbar-display.small"));
			smallIcons.addEventListener('command', function(event) {
				doc.getElementById(toolbarId).setAttribute('iconsize', 'small');
				doc.persist(toolbarId, 'iconsize');
			}, false);
			submenu.appendChild(smallIcons);
			
			let largeIcons = doc.createElement("menuitem");
			largeIcons.setAttribute('type', 'radio');
			largeIcons.setAttribute('name', 'icons');
			if(toolbar.getAttribute('iconsize') == 'large') {
				largeIcons.setAttribute('checked', true);
			}
			largeIcons.setAttribute('label', stringBundle.GetStringFromName("tb-toolbar-display.large"));
			largeIcons.addEventListener('command', function(event) {
				doc.getElementById(toolbarId).setAttribute('iconsize', 'large');
				doc.persist(toolbarId, 'iconsize');
			}, false);
			submenu.appendChild(largeIcons);
			
			submenu.appendChild(doc.createElement("menuseparator"));
			
			let iconMode = doc.createElement("menuitem");
			iconMode.setAttribute('type', 'radio');
			iconMode.setAttribute('name', 'mode');
			if(toolbar.getAttribute('mode') == 'icons') {
				iconMode.setAttribute('checked', true);
			}
			iconMode.setAttribute('label', stringBundle.GetStringFromName("tb-toolbar-display.icons"));
			iconMode.addEventListener('command', function(event) {
				doc.getElementById(toolbarId).setAttribute('mode', 'icons');
				doc.persist(toolbarId, 'mode');
			}, false);
			submenu.appendChild(iconMode);
			
			let textMode = doc.createElement("menuitem");
			textMode.setAttribute('type', 'radio');
			textMode.setAttribute('name', 'mode');
			if(toolbar.getAttribute('mode') == 'text') {
				textMode.setAttribute('checked', true);
			}
			textMode.setAttribute('label', stringBundle.GetStringFromName("tb-toolbar-display.text"));
			textMode.addEventListener('command', function(event) {
				doc.getElementById(toolbarId).setAttribute('mode', 'text');
				doc.persist(toolbarId, 'mode');
			}, false);
			submenu.appendChild(textMode);
			
			let iconTextMode = doc.createElement("menuitem");
			iconTextMode.setAttribute('type', 'radio');
			iconTextMode.setAttribute('name', 'mode');
			if(toolbar.getAttribute('mode') == 'full') {
				iconTextMode.setAttribute('checked', true);
			}
			iconTextMode.setAttribute('label', stringBundle.GetStringFromName("tb-toolbar-display.icons-text"));
			iconTextMode.addEventListener('command', function(event) {
				doc.getElementById(toolbarId).setAttribute('mode', 'full');
				doc.persist(toolbarId, 'mode');
			}, false);
			submenu.appendChild(iconTextMode);
			
			submenu._generated = true;
		}, false);
		menuItem.appendChild(menupopup);
		popup.appendChild(menuItem);
	}
}
