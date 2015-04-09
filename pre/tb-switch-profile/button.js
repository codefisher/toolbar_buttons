toProfileManager: function(event) {
	var win = event.target.ownerDocument.defaultView;
	// This is mostly from working out what SeaMonkey does, and making it work for Firefox/Thunderbird
	var promgrWin = Services.wm.getMostRecentWindow("mozilla:profileSelection");
	if (promgrWin) {
		promgrWin.focus();
	} else {
		var params = Cc["@mozilla.org/embedcomp/dialogparam;1"].createInstance(Ci.nsIDialogParamBlock);

		params.objects = Cc["@mozilla.org/array;1"].createInstance(Ci.nsIMutableArray);

			
		var ww = Cc["@mozilla.org/embedcomp/window-watcher;1"].getService(Ci.nsIWindowWatcher);
		ww.openWindow(win, "chrome://mozapps/content/profile/profileSelection.xul",
						"", "centerscreen,chrome,titlebar,dialog,modal", params);
		
		if(params.GetString(0) && params.GetInt(0)) {
			var profileName = params.GetString(0);
			var ProfileService = Cc["@mozilla.org/toolkit/profile-service;1"].getService(Ci.nsIToolkitProfileService);
			var profile =  ProfileService.getProfileByName(profileName);
			try {
				var profileLock = profile.lock({});
				ProfileService.selectedProfile = profile;
				ProfileService.flush();
				profileLock.unlock();
			} catch(e) {
				// should tell them it failed 
				return false;
			}

			// now ask all interested parties
			var cancelQuit = Components.classes["@mozilla.org/supports-PRBool;1"].createInstance(Ci.nsISupportsPRBool);
			Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService).notifyObservers(cancelQuit, "quit-application-requested", null);
		
			// Something aborted the quit process.
			if (cancelQuit.data) {
				return false;
			} else {
				try {
					var env = Cc["@mozilla.org/process/environment;1"].getService(Ci.nsIEnvironment);
					env.set("XRE_PROFILE_NAME", profile.name);
					env.set("XRE_PROFILE_PATH", profile.rootDir.path);
					env.set("XRE_PROFILE_LOCAL_PATH", profile.localDir.path);
					var app = Cc["@mozilla.org/toolkit/app-startup;1"].getService(Ci.nsIAppStartup);
					app.quit(app.eAttemptQuit | app.eRestart);
					return true;
				} catch (e) {
					env.set("XRE_PROFILE_NAME", "");
					env.set("XRE_PROFILE_PATH", "");
					env.set("XRE_PROFILE_LOCAL_PATH", "");
					return false;
				}
			}
		}
	}
}