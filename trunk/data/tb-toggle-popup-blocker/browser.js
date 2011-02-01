togglePopUp: function() {
	var blockPopUp = toolbar_buttons.interfaces.ExtensionPrefBranch
		.getBoolPref("block.popups");
	var button = document.getElementById("tb-toggle-popup-blocker");
	if (blockPopUp == true) {
		toolbar_buttons.interfaces.PrefBranch.setCharPref("dom.popup_allowed_events","change click dblclick mouseup reset submit");
		toolbar_buttons.interfaces.PrefBranch.setIntPref("privacy.popups.disable_from_plugins", 0);
	}
	else {
		toolbar_buttons.interfaces.PrefBranch.setCharPref("dom.popup_allowed_events","");
		toolbar_buttons.interfaces.PrefBranch.setIntPref("privacy.popups.disable_from_plugins", 2);
	}
	toolbar_buttons.interfaces.ExtensionPrefBranch.setBoolPref("block.popups", !blockPopUp);
	button.setAttribute("activated", !blockPopUp);
}

viewPopupExceptions: function(event) {
	if(event.button == 1) {
		toolbar_buttons.openPermissions("popup",
				"popuppermissionstitle", "popuppermissionstext");
	}
}

toolbar_buttons.loadPrefWatcher("{{pref_root}}block.popups", "tb-toggle-popup-blocker");