setUpMenuShower: function(doc) {
	var observer = {
		observe: function(aSubject, aTopic, aData) {
			var menu = doc.getElementById(aData);
			if(menu) {
				menu.setAttribute('hidden', !this.prefs.getBoolPref(aData));
			}
		},
		unregister: function() {
			this.prefs.removeObserver("", this);
		},
		register: function() {toolbar_buttons.registerCleanUpFunction(this.unregister);
			this.prefs = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService).getBranch("{{pref_root}}showamenu.");
			this.prefs.addObserver("", this, false);
			var self = this;
			toolbar_buttons.registerCleanUpFunction(function() {
				self.prefs.removeObserver("", self);
			});
			var attrList = this.prefs.getChildList('', {});
			for(var i in attrList) {
				var menu = doc.getElementById(attrList[i]);
				if(menu) {
					menu.setAttribute('hidden', !this.prefs.getBoolPref(attrList[i]));
				}
			}
		}
	};
	observer.register();
}
