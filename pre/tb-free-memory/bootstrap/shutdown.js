
	if(memoryIdleTime) {
		idleService.removeIdleObserver(memoryIdelObserver, memoryIdleTime);
	}
	if(memorySettingWatcher) {
		try {
			memorySettingWatcher.shutdown();
		} catch(e) {}
	}