openAboutAboutMenu: function(item, event) {
	if(event.target != event.currentTarget) {
		return;
	}
	if(item.getAttribute('cui-areatype') == 'menu-panel') {
		var win = item.ownerDocument.defaultView;
		event.preventDefault();
		event.stopPropagation();
		var panel = item.ownerDocument.getElementById('tb-about-about-panel-view');
		toolbar_buttons.aboutAboutMenu(panel);
		win.PanelUI.showSubView('tb-about-about-panel-view', item, CustomizableUI.AREA_PANEL);
	} else {
		event.target.firstChild.openPopup(event.target, "after_start");
	}
}

aboutAboutMenu: function(item) {
	var doc = item.ownerDocument;
	if (item.firstChild) {
		return;
	}
	if(item.tagName == 'panelview') {
		// these lines take care working well with the Panel
		var itemType = 'toolbarbutton';
		item.classList.add('mozbutton-panelview')
		var vbox = doc.createElement('vbox');
		item.appendChild(vbox);
		item = vbox;
		var className = 'subviewbutton';
	} else {
		var itemType = 'menuitem';
		var className = '';
	}
	var ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
	var gProtocols = [];
	var whiteList = ["blank"];
	for (var cid in Cc) {
		var result = cid.match(/@mozilla.org\/network\/protocol\/about;1\?what\=(.*)$/);
		if (result) {
			var aboutType = result[1];
			var contract = "@mozilla.org/network/protocol/about;1?what=" + aboutType;
			try {
				var am = Cc[contract].getService(Ci.nsIAboutModule);
				var uri = ios.newURI("about:"+aboutType, null, null);
				var flags = am.getURIFlags(uri);
				if (!(flags & Ci.nsIAboutModule.HIDE_FROM_ABOUTABOUT) || whiteList.indexOf(aboutType) != -1) {
					gProtocols.push(aboutType);
				}
			} catch (e) {
				// getService might have thrown if the component doesn't actually
				// implement nsIAboutModule
			}
		}
	}
	gProtocols.sort().forEach(function(aProtocol) {
		var uri = "about:" + aProtocol;
		var menuItem = doc.createElement(itemType);
		menuItem.setAttribute("label", uri);
		if(className) {
			menuItem.classList.add(className);
		}
		menuItem.addEventListener("click", function(event) {
				toolbar_buttons.openPageInTab(uri, event);
			}, false);
		item.appendChild(menuItem);
	});
}