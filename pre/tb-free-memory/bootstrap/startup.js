
	var idlePrefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService)
			.getBranch("{{pref_root}}free-memory.idle.");
	var idleService = Components.classes["@mozilla.org/widget/idleservice;1"]
			.getService(Components.interfaces.nsIIdleService);
	if(idlePrefs.getBoolPref('enabled') && idlePrefs.getIntPref('time')) {
		memoryIdleTime = idlePrefs.getIntPref('time') * 60;
		idleService.addIdleObserver(memoryIdelObserver, memoryIdleTime);
	}
	memorySettingWatcher = settingWatcher("{{pref_root}}free-memory.idle.", function(subject, topic, data) {
		if(memoryIdleTime) {
			idleService.removeIdleObserver(memoryIdelObserver, memoryIdleTime);
		}
		if(subject.getBoolPref('enabled') && subject.getBoolPref('time')) {
			memoryIdleTime = subject.getBoolPref('time') * 60;
			idleService.addIdleObserver(memoryIdelObserver, memoryIdleTime);
		}
	});