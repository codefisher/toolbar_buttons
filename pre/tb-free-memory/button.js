freeMemoryAction: function(event) {
	var prefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
	var option = prefs.getIntPref('free-memory.default.action');
	switch (option) {
		case 0:
			toolbar_buttons.freeMemory(event);
			break;
		case 1:
			toolbar_buttons.freeMemoryGarbageCollection(event);
			break;
		case 2:
			toolbar_buttons.freeMemoryCycleCollection(event);
			break;
		default:
			for(var i = 0; i < 2; i++) {
				toolbar_buttons.freeMemory(event, true);
				toolbar_buttons.freeMemoryGarbageCollection(event, true);
				toolbar_buttons.freeMemoryCycleCollection(event, true);
			}
			toolbar_buttons.freeMemoryNotify();
	}
}

freeMemory: function(event, no_notify) {
	Services.obs.notifyObservers(null, "child-mmu-request", null);
	let gMgr = Cc["@mozilla.org/memory-reporter-manager;1"]
			.getService(Ci.nsIMemoryReporterManager);
	gMgr.minimizeMemoryUsage(null);
	if(!no_notify) {
		toolbar_buttons.freeMemoryNotify();
	}
}

freeMemoryNotify: function() {
	var prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService)
			.getBranch("{{pref_root}}free-memory.");
	if(prefs.getBoolPref("show-notifications")) {
		var notifications = jetpack("sdk/notifications");

		var stringBundle = toolbar_buttons.interfaces.StringBundleService
			.createBundle("chrome://{{chrome_name}}/locale/{{locale_file_prefix}}button.properties");

		notifications.notify({
			title: stringBundle.GetStringFromName("tb-free-memory.label"),
			text: stringBundle.GetStringFromName("tb-free-memory.cleared"),
			data: "",
			iconURL: "chrome://{{chrome_name}}/skin/option/memory.png",
			onClick: function (data) {
			}
		});
	}
}

freeMemoryGarbageCollection: function(event, no_notify) {
	Services.obs.notifyObservers(null, "child-gc-request", null);
	Cu.forceGC();
	if(!no_notify) {
		toolbar_buttons.freeMemoryNotify();
	}
}

freeMemoryCycleCollection: function(event, no_notify) {
	var win = event.target.ownerDocument.defaultView;
	Services.obs.notifyObservers(null, "child-cc-request", null);
	win.QueryInterface(Ci.nsIInterfaceRequestor)
		.getInterface(Ci.nsIDOMWindowUtils)
		.cycleCollect();
	if(!no_notify) {
		toolbar_buttons.freeMemoryNotify();
	}
}

freeMemorySetMenu: function(event, item) {
	var reporterManager = Components.classes["@mozilla.org/memory-reporter-manager;1"]
		.getService(Components.interfaces.nsIMemoryReporterManager);
	//reporterManager.init();
	item.lastChild.setAttribute("label", toolbar_buttons.formatBytes(reporterManager.explicit));
}

formatBytes: function(aBytes) {
	// this function is lifted out of the Firefox source code
	let unit = " MB";
	let mbytes = (aBytes / (1024 * 1024)).toFixed(2);
	let a = String(mbytes).split(".");
	// If the argument to formatInt() is -0, it will print the negative sign.
	return toolbar_buttons.formatInt(Number(a[0])) + "." + a[1] + unit;
}

hasNegativeSign: function(aN) {
	if (aN === 0) {                   // this succeeds for 0 and -0
		return 1 / aN === -Infinity;    // this succeeds for -0
	}
	return aN < 0;
}

formatInt: function(aN, aExtra) {
	let neg = false;
	if (toolbar_buttons.hasNegativeSign(aN)) {
		neg = true;
		aN = -aN;
	}
	let s = [];
	while (true) {
		let k = aN % 1000;
		aN = Math.floor(aN / 1000);
		if (aN > 0) {
			if (k < 10) {
				s.unshift(",00", k);
			} else if (k < 100) {
				s.unshift(",0", k);
			} else {
				s.unshift(",", k);
			}
		} else {
			s.unshift(k);
			break;
		}
	}
	if (neg) {
		s.unshift("-");
	}
	if (aExtra) {
		s.push(aExtra);
	}
	return s.join("");
}
