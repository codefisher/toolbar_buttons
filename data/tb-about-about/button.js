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
	for (var cid in Cc) {
		var result = cid.match(/@mozilla.org\/network\/protocol\/about;1\?what\=(.*)$/);
		if (result) {
			var aboutType = result[1];
			var contract = "@mozilla.org/network/protocol/about;1?what=" + aboutType;
			try {
				var am = Cc[contract].getService(Ci.nsIAboutModule);
				var uri = ios.newURI("about:"+aboutType, null, null);
				var flags = am.getURIFlags(uri);
				if (!(flags & Ci.nsIAboutModule.HIDE_FROM_ABOUTABOUT)) {
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
		menuItem.classList.add(className);
		menuItem.addEventListener("click", function(event) {
				toolbar_buttons.openPageInTab(uri, event);
			}, false);
		item.appendChild(menuItem);
	});
}