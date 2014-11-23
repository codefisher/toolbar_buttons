togglePipeline: function(button) {
	toolbar_buttons.prefToggleStatus(button, "network.http.pipelining");
	toolbar_buttons.checkBrowserReload();
}

toolbar_buttons.loadPrefWatcher("network.http.pipelining", "tb-pipeline-toggle");
