togglePipeline: function(button) {
	toolbar_buttons.prefToggleStatus(button, "network.http.pipelining");
	toolbar_buttons.checkBrowserReload(button.ownerDocument.defaultView);
}

toolbar_buttons.loadPrefWatcher(document, "network.http.pipelining", "tb-pipeline-toggle");
