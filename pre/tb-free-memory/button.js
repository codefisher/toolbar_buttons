freeMemory: function(event) {
	Services.obs.notifyObservers(null, "child-mmu-request", null);
	let gMgr = Cc["@mozilla.org/memory-reporter-manager;1"]
			.getService(Ci.nsIMemoryReporterManager);
	gMgr.minimizeMemoryUsage(null);
}

freeMemoryGarbageCollection: function(event) {
	Services.obs.notifyObservers(null, "child-gc-request", null);
	Cu.forceGC();
}

freeMemoryCycleCollection: function(event) {
	var win = event.target.ownerDocument.defaultView;
	Services.obs.notifyObservers(null, "child-cc-request", null);
	win.QueryInterface(Ci.nsIInterfaceRequestor)
		.getInterface(Ci.nsIDOMWindowUtils)
		.cycleCollect();
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
