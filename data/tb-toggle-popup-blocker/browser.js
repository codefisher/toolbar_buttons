togglePopUp: function(event) {
	var doc = event.target.ownerDocument;
	var blockPopUp = toolbar_buttons.interfaces.PrefBranch.getBoolPref("dom.disable_open_during_load");
	var button = doc.getElementById("tb-toggle-popup-blocker");
	if (blockPopUp === true) {
		//toolbar_buttons.interfaces.PrefBranch.setCharPref("dom.disable_open_during_load","change click dblclick mouseup reset submit");
		toolbar_buttons.interfaces.PrefBranch.setIntPref("privacy.popups.disable_from_plugins", 0);
	} else {
		//toolbar_buttons.interfaces.PrefBranch.setCharPref("dom.popup_allowed_events","");
		toolbar_buttons.interfaces.PrefBranch.setIntPref("privacy.popups.disable_from_plugins", 2);
	}
	toolbar_buttons.interfaces.PrefBranch.setBoolPref("dom.disable_open_during_load", !blockPopUp);
	toolbar_buttons.setButtonStatus(button, !blockPopUp);
}

viewPopupExceptions: function(event) {
	if(event.button == 1) {
		toolbar_buttons.openPermissions(event, "popup",
				"popuppermissionstitle", "popuppermissionstext");
	}
}

toolbar_buttons.loadPrefWatcher(document, "dom.disable_open_during_load", "tb-toggle-popup-blocker");