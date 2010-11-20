showOnlyThisFrame: function() {
	var focusedWindow = document.commandDispatcher.focusedWindow;
	if (isContentFrame(focusedWindow)) {
		var doc = focusedWindow.document;
		var frameURL = doc.location.href;

		urlSecurityCheck(frameURL, gBrowser.contentPrincipal,
						 Ci.nsIScriptSecurityManager.DISALLOW_SCRIPT);
		var referrer = doc.referrer;
		gBrowser.loadURI(frameURL, referrer ? makeURI(referrer) : null);
	}
}