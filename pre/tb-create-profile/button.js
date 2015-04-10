CreateProfileWizard: function(event) {
	var win = event.target.ownerDocument.defaultView;
	var prof = Cc["@mozilla.org/toolkit/profile-service;1"].getService(Ci.nsIToolkitProfileService);
	if(!win.CreateProfile) {
		win.CreateProfile = function(aProfile) {}
	}
	win.openDialog('chrome://mozapps/content/profile/createProfileWizard.xul',
			'', 'centerscreen,chrome,modal,titlebar', prof);
}