upOneFolder: function(event) {
	var win = event.target.ownerDocument.defaultView;
	var location = win.content.document.location,
		pathname = location.pathname;
	if(pathname == "/" && location.hash == "") {
		return;
	}
	pathname = toolbar_buttons.trimFolderPath(pathname);
	win.content.document.location = location.protocol + "//" + location.host + pathname;
}

trimFolderPath: function(pathname) {
	if (pathname.indexOf("index") != -1) {
		pathname = pathname.substring(0, pathname.indexOf("index"));
	}
	return pathname.substring(0, pathname.substring(0, pathname.length - 1).lastIndexOf("/") + 1);
}

loadHigherFolders: function(popup) {
	var doc = popup.ownerDocument;
	var win = doc.defaultView;
	while (popup.lastChild && popup.lastChild.nodeName != 'menuseparator') {
		popup.removeChild(popup.lastChild);
	}
	var item = null, location = win.content.document.location,
		pathname = location.pathname;
	if(!pathname) {
		item = doc.createElement("menuitem");
		var stringBundle = toolbar_buttons.interfaces.StringBundleService
			.createBundle("chrome://{{chrome_name}}/locale/{{locale_file_prefix}}button.properties");
		var empty = stringBundle.GetStringFromName("empty");
		item.setAttribute("label", empty);
		item.setAttribute("disabled", true);
		popup.appendChild(item);
	} else {
		pathname = toolbar_buttons.trimFolderPath(pathname);
		do {
			item = doc.createElement("menuitem");
			item.setAttribute("label", location.host + pathname);
			item.addEventListener("command", function() {
				win.loadURI(location.protocol + "//" + location.host + pathname);
			}, false);
			item.addEventListener("click", function(event) {
					toolbar_buttons.openPageTab(location.protocol + "//" + location.host + pathname, event);
			}, false);
			popup.appendChild(item);
			pathname = toolbar_buttons.trimFolderPath(pathname);
		} while (pathname);
		if(location.pathname == "/" && location.hash == "") {
			item.setAttribute("disabled", true);
		}
	}
}