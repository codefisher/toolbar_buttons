toggleSendReferrer: function(button) {
	toolbar_buttons.prefToggleNumber(button, "network.http.sendRefererHeader", [1,2,0]);
}

toolbar_buttons.loadPrefWatcher("network.http.sendRefererHeader", "tb-send-referrer");
