setUpMenuShower: function() {
	var prefs = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService).getBranch("{{pref_root}}showamenu.");
	prefs.addObserver("", {
		observe: function(aSubject, aTopic, aData) {
			var menu = document.getElementById(aData);
			if(menu) {
				menu.setAttribute('hidden', !prefs.getBoolPref(aData));
			}
		}
	}, false);
	var attrList = prefs.getChildList('', {});
	for(var i in attrList) {
		var menu = document.getElementById(attrList[i]);
		if(menu) {
			menu.setAttribute('hidden', !prefs.getBoolPref(attrList[i]));
		}
	}
}
