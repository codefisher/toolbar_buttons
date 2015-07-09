var memoryIdelObserver = {
	observe: function(aSubject, aTopic, aData) {
		if(aTopic != 'idle') {
			return;
		}
		Services.obs.notifyObservers(null, "child-mmu-request", null);
		let gMgr = Cc["@mozilla.org/memory-reporter-manager;1"]
				.getService(Ci.nsIMemoryReporterManager);
		gMgr.minimizeMemoryUsage(null);

		var prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService)
			.getBranch("{{pref_root}}free-memory.");

		if(prefs.getBoolPref("show-notifications")) {
			var notifications = jetpack("sdk/notifications");

			var stringBundle = Cc['@mozilla.org/intl/stringbundle;1'].getService(Ci.nsIStringBundleService)
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
};
var memoryIdleTime = 0;
var memorySettingWatcher = null;