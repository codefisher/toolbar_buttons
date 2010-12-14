upOneFolder: function() {
	var location = window.content.document.location,
		pathname = location.pathname;
	if(pathname == "/" && location.hash == "")
		return;
	pathname = toolbar_buttons.trimFolderPath(pathname);
	window.content.document.location = location.protocol + "//" + location.host + pathname;
}

trimFolderPath: function(pathname) {
	if (pathname.indexOf("index") != -1) {
		pathname = href.substring(0, pathname.indexOf("index"));
	}
	return pathname.substring(0, pathname.substring(0, pathname.length - 1).lastIndexOf("/") + 1);
}

loadHigherFolders: function(popup) {
	while(popup.firstChild)
		popup.removeChild(popup.firstChild);
	var item = null, location = window.content.document.location,
		pathname = location.pathname;
	pathname = toolbar_buttons.trimFolderPath(pathname);
	do {
		item = document.createElement("menuitem");
		item.setAttribute("label", location.host + pathname);
		item.addEventListener("command", function() {
			window.content.document.location = location.protocol + "//" + location.host + pathname;
		}, false);
		popup.appendChild(item);
		pathname = toolbar_buttons.trimFolderPath(pathname);
	} while (pathname);
	if(location.pathname == "/" && location.hash == "")
		item.setAttribute("disabled", true);
}