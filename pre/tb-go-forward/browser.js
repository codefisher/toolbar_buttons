forwardButtonBroadcast: function(event) {
	var button = event.target.parentNode;
	if(toolbar_buttons.interfaces.ExtensionPrefBranch.getBoolPref("tb-go-forward.hide-when-disabled")) {
		if(button.getAttribute('disabled') == 'true') {
			button.setAttribute('hidden', 'true');
		} else {
			button.removeAttribute('hidden');
		}
	} else {
		button.removeAttribute('hidden');
	}
}