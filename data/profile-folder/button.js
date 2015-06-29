profileFolder: function() {
	var file = toolbar_buttons.interfaces.Properties.get('ProfD', Ci.nsIFile)
		.QueryInterface(Ci.nsILocalFile);
	try {
		file.launch();
	} catch(e) {
		var uri = toolbar_buttons.interfaces.IOService.newFileURI(file);
		toolbar_buttons.interfaces.ExternalProtocolService.loadUrl(uri);
	}
}

profileFolderSetMenu: function(event, popup) {
	var doc = event.target.ownerDocument;
	while(popup.firstChild) {
		popup.removeChild(popup.firstChild);
	}
	var profileService = Cc["@mozilla.org/toolkit/profile-service;1"].getService(Ci.nsIToolkitProfileService);
	var profileList = profileService.profiles;
	while (profileList.hasMoreElements()) {
		var profile = profileList.getNext().QueryInterface(Ci.nsIToolkitProfile);
		var menuitem = doc.createElement('menuitem');
		menuitem.setAttribute('label', profile.name);
		menuitem.addEventListener('command', toolbar_buttons.openProfileFolder(profile), false);
		popup.appendChild(menuitem);
	}
}

openProfileFolder: function(profile) {
	return function(event) {
		try {
			profile.rootDir.launch();
		} catch (e) {
			var uri = toolbar_buttons.interfaces.IOService.newFileURI(profile.rootDir);
			toolbar_buttons.interfaces.ExternalProtocolService.loadUrl(uri);
		}
	}
}