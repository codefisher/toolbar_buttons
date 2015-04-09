setAnimationState: function(doc, state) {
	var prefs = toolbar_buttons.interfaces.PrefBranch;
	prefs.setBoolPref("browser.blink_allowed", state);
	prefs.setCharPref("image.animation_mode", state ? "normal" : "none");
	toolbar_buttons.cssFileToUserContent(doc, "chrome://{{chrome_name}}/content/files/marquee.css", state, false, "stop-animation");
	toolbar_buttons.setButtonStatus(doc.getElementById("stop-animation"), state);
}

toolbar_buttons.loadContectBlocker(document, "{{pref_root}}marquee", "marquee",
		"stop-animation", "chrome://{{chrome_name}}/content/files/marquee.css",
		toolbar_buttons.setAnimationState);
