setAnimationState: function(state) {
	var prefs = toolbar_buttons.interfaces.PrefBranch;
	prefs.setBoolPref("browser.blink_allowed", state);
	prefs.setCharPref("image.animation_mode", state ? "normal" : "none");
	toolbar_buttons.cssFileToUserContent("chrome://{{chrome_name}}/content/marquee.css", state, false, "stop-animation");
	toolbar_buttons.setButtonStatus(document.getElementById("stop-animation"), state);
}

toolbar_buttons.loadContectBlocker("{{pref_root}}marquee", "marquee",
		"stop-animation", "chrome://{{chrome_name}}/content/marquee.css",
		toolbar_buttons.setAnimationState);