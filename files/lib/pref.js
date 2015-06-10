prefToggleStatus: function(button, pref) {
	var prefs = toolbar_buttons.interfaces.PrefBranch,
		state = prefs.getBoolPref(pref);
	prefs.setBoolPref(pref, !state);
	toolbar_buttons.setButtonStatus(button, !state);
	return !state;
}

extensionPrefToggleStatus: function(button, pref) {
	var prefs = toolbar_buttons.interfaces.ExtensionPrefBranch,
		state = prefs.getBoolPref(pref);
	prefs.setBoolPref(pref, !state);
	toolbar_buttons.setButtonStatus(button, !state);
	return !state;
}

PreferenceWatcher: function() {
	this.prefs = null;
	this.button = null;
	this.pref = null;
	this.func = null;

	this.startup = function(doc, pref, button, func) {
		this.prefs = toolbar_buttons.interfaces.PrefService.getBranch(pref);
		this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
		this.prefs.addObserver("", this, false);
		this.doc = doc;
		if(button)
			this.button = doc.getElementById(button);
		this.button_id = button;
		this.func = func;
		this.pref = pref;
		try {
			this.setStatus();
		} catch(e) {} // pref might not exist
		var self = this;
		toolbar_buttons.registerCleanUpFunction(function() {
			self.prefs.removeObserver("", self);
		});
	};

	this.shutdown = function() {
		this.prefs.removeObserver("", this);
	};

	this.setStatus = function() {
		if(!this.button)
			return
		// remove the checked state of any old buttons
		this.button.removeAttribute("checked");
		var prefs = toolbar_buttons.interfaces.PrefBranch, state = null;
		switch(prefs.getPrefType(this.pref)) {
			case prefs.PREF_BOOL:
				state = prefs.getBoolPref(this.pref);
				break;
			case prefs.PREF_INT:
				state = prefs.getIntPref(this.pref);
				break;
			case prefs.PREF_STRING:
				state = prefs.getCharPref(this.pref);
				break;
			default:
				return;
		}
		if(this.func) {
			this.func(this.doc, state);
		} else {
			toolbar_buttons.setButtonStatus(this.button, state);
		}
	};

	this.observe = function(subject, topic, data) {
		if (topic != "nsPref:changed") {
			return;
		}
		try {
			if(!this.button)
				this.button = this.doc.getElementById(this.button_id);
			this.setStatus();
		} catch(e) {} // button might not exist
	};
}

prefToggleNumber: function(button, pref, next) {
	var prefs = toolbar_buttons.interfaces.PrefBranch,
		setting = prefs.getIntPref(pref);
	prefs.setIntPref(pref, next[setting]);
	toolbar_buttons.setButtonStatus(button, next[setting]);
	return next[setting];
}

loadPrefWatcher: function(doc, pref, button_id, func) {
	var win = doc.defaultView;
	win.setTimeout(function() {
		var prefWatch = new toolbar_buttons.PreferenceWatcher();
		prefWatch.startup(doc, pref, button_id, func);
		win.addEventListener("unload", function loadPrefUnload(e) {
			win.removeEventListener("unload", loadPrefUnload, false);
			prefWatch.shutdown();
		}, false);
	}, 0);
}


settingWatcher: function(pref, func) {
	this.prefs = toolbar_buttons.interfaces.PrefService.getBranch(pref);
	this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
	this.pref = pref;
	this.func = func;

	this.startup = function() {
		this.prefs.addObserver("", this, false);
		var self = this;
		toolbar_buttons.registerCleanUpFunction(function() {
			self.prefs.removeObserver("", self);
		});
	};

	this.shutdown = function() {
		this.prefs.removeObserver("", this);
	};

	this.observe = function(subject, topic, data) {
		if (topic != "nsPref:changed") {
			return;
		}
		try {
			this.func(subject, topic, data);
		} catch(e) {} // button might not exist
	};
}
