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

	this.startup = function(pref, button, func) {
		this.prefs = toolbar_buttons.interfaces.PrefService.getBranch(pref);
		this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch);
		this.prefs.addObserver("", this, false);
		if(button)
			this.button = document.getElementById(button);
		this.button_id = button
		this.func = func;
		this.pref = pref;
		//try {
			this.setStatus();
		//} catch(e) {} // pref might not exist
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
			this.func(state);
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
				this.button = document.getElementById(this.button_id);
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

loadPrefWatcher: function(pref, button_id, func) {
	window.addEventListener("load", function(e) {
		var prefWatch = new toolbar_buttons.PreferenceWatcher();
		prefWatch.startup(pref, button_id, func);
		window.addEventListener("unload", function(e) {
			prefWatch.shutdown();
		}, false);
	}, false);
}