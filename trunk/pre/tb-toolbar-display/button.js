getTogglableToolbars: function() {
	// this is based on code from Firefox.
	if(window.gNavToolbox) {
		var toolbarBox = window.gNavToolbox;
	} else {
		var toolbarBox = document.getElementById('mail-toolbox');
	}
	let toolbarNodes = Array.slice(toolbarBox.childNodes);
	toolbarNodes = toolbarNodes.concat(toolbarBox.externalToolbars);
	toolbarNodes = toolbarNodes.filter(node => node.getAttribute("toolbarname") || node.getAttribute("aria-label"));
	if (document.documentElement.getAttribute("shellshowingmenubar") == "true") {
		toolbarNodes = toolbarNodes.filter(node => node.id != "toolbar-menubar");
	}
	return toolbarNodes;
}

loadToolbarDisplayMenu: function(event, popup) {
	if (popup != event.currentTarget)
		return;
	while(popup.firstChild) {
		popup.removeChild(popup.firstChild);
	}
	let toolbarNodes = toolbar_buttons.getTogglableToolbars();
	
	var stringBundle = toolbar_buttons.interfaces.StringBundleService
				.createBundle("chrome://{{chrome_name}}/locale/{{locale_file_prefix}}button.properties");
				
	for (let toolbar of toolbarNodes) {
		let menuItem = document.createElement("menu");
		var label = toolbar.getAttribute("toolbarname");
		if(!label) {
			label = toolbar.getAttribute("aria-label");
		}
		menuItem.setAttribute("label", label);
		let menupopup = document.createElement("menupopup");
		menupopup.setAttribute('toolbarid', toolbar.id);
		menupopup.addEventListener('popupshowing', function(event) {
			var submenu = event.currentTarget;
			event.stopPropagation();
			if(submenu._generated) {
				return;
			}
			var toolbarId = submenu.getAttribute('toolbarid');
			var toolbar = document.getElementById(toolbarId);

			let smallIcons = document.createElement("menuitem");
			smallIcons.setAttribute('type', 'radio');
			smallIcons.setAttribute('name', 'icons');
			if(toolbar.getAttribute('iconsize') == 'small') {
				smallIcons.setAttribute('checked', true);
			}
			smallIcons.setAttribute('label', stringBundle.GetStringFromName("tb-toolbar-display.small"));
			smallIcons.addEventListener('command', function(event) {
				document.getElementById(toolbarId).setAttribute('iconsize', 'small');
				document.persist(toolbarId, 'iconsize');
			}, false);
			submenu.appendChild(smallIcons);
			
			let largeIcons = document.createElement("menuitem");
			largeIcons.setAttribute('type', 'radio');
			largeIcons.setAttribute('name', 'icons');
			if(toolbar.getAttribute('iconsize') == 'large') {
				largeIcons.setAttribute('checked', true);
			}
			largeIcons.setAttribute('label', stringBundle.GetStringFromName("tb-toolbar-display.large"));
			largeIcons.addEventListener('command', function(event) {
				document.getElementById(toolbarId).setAttribute('iconsize', 'large');
				document.persist(toolbarId, 'iconsize');
			}, false);
			submenu.appendChild(largeIcons);
			
			submenu.appendChild(document.createElement("menuseparatornuitem"));
			
			let iconMode = document.createElement("menuitem");
			iconMode.setAttribute('type', 'radio');
			iconMode.setAttribute('name', 'mode');
			if(toolbar.getAttribute('mode') == 'icons') {
				iconMode.setAttribute('checked', true);
			}
			iconMode.setAttribute('label', stringBundle.GetStringFromName("tb-toolbar-display.icons"));
			iconMode.addEventListener('command', function(event) {
				document.getElementById(toolbarId).setAttribute('mode', 'icons');
				document.persist(toolbarId, 'mode');
			}, false);
			submenu.appendChild(iconMode);
			
			let textMode = document.createElement("menuitem");
			textMode.setAttribute('type', 'radio');
			textMode.setAttribute('name', 'mode');
			if(toolbar.getAttribute('mode') == 'text') {
				textMode.setAttribute('checked', true);
			}
			textMode.setAttribute('label', stringBundle.GetStringFromName("tb-toolbar-display.text"));
			textMode.addEventListener('command', function(event) {
				document.getElementById(toolbarId).setAttribute('mode', 'text');
				document.persist(toolbarId, 'mode');
			}, false);
			submenu.appendChild(textMode);
			
			let iconTextMode = document.createElement("menuitem");
			iconTextMode.setAttribute('type', 'radio');
			iconTextMode.setAttribute('name', 'mode');
			if(toolbar.getAttribute('mode') == 'full') {
				iconTextMode.setAttribute('checked', true);
			}
			iconTextMode.setAttribute('label', stringBundle.GetStringFromName("tb-toolbar-display.icons-text"));
			iconTextMode.addEventListener('command', function(event) {
				document.getElementById(toolbarId).setAttribute('mode', 'full');
				document.persist(toolbarId, 'mode');
			}, false);
			submenu.appendChild(iconTextMode);
			
			submenu._generated = true;
		}, false);
		menuItem.appendChild(menupopup);
		popup.appendChild(menuItem);
	}
}
