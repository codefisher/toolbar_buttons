goClearCache: function(event) {
	var win = event.target.ownerDocument.defaultView;
	var prefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
	var timespan = prefs.getIntPref('clear-cache.timeSpan');

	/* Same script as used by the Clear Recient History window
	 * less code for us, and less bugs. */
	var loader = Cc["@mozilla.org/moz/jssubscript-loader;1"].getService(Ci.mozIJSSubScriptLoader);
	var obj = {};
	loader.loadSubScript("chrome://browser/content/sanitize.js", obj);
	var Sanitizer = obj.Sanitizer;

	var s = new Sanitizer();
	s.prefDomain = "{{pref_root}}clear-cache.";
	s.range = Sanitizer.getClearRange(timespan);

	var stringBundle = toolbar_buttons.interfaces.StringBundleService
			.createBundle("chrome://{{chrome_name}}/locale/{{locale_file_prefix}}button.properties");

	if (prefs.getBoolPref("clear-cache.no-prompt") !== true) {
		var restartQuestion = stringBundle.GetStringFromName("tb-clear-cache.question");
		var dontAsk = stringBundle.GetStringFromName("dont-ask");
		var restartTitle = stringBundle.GetStringFromName("tb-clear-cache.label");
		var check = {value: false};
		var result = toolbar_buttons.interfaces.PromptService.confirmCheck(null,
				restartTitle, restartQuestion, dontAsk, check);
		prefs.setBoolPref("clear-cache.no-prompt", check.value);
		if (result === false) {
			return;
		}
	}

	try {
		s.sanitize().then(null, Components.utils.reportError).then(function() {
			new win.Notification(stringBundle.GetStringFromName("tb-clear-cache.label"), {
				body: stringBundle.GetStringFromName("tb-clear-cache.message"),
				icon: "chrome://{{chrome_name}}/content/files/backspace.svg"
			});
		}).then(null, Components.utils.reportError);
	} catch (er) {
		Components.utils.reportError("Exception during sanitize: " + er);
	}
}

setUpClearCacheMenu: function(event) {
	var childNodes = event.target.childNodes;
	var prefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
	var timeSpan = prefs.getIntPref('clear-cache.timeSpan');
	for(var i = 0; i < childNodes.length; i++) {
		var node = childNodes[i];
		var name = node.getAttribute('name');
		if(name == "storage") {
			node.setAttribute('checked', prefs.getBoolPref(node.getAttribute('pref')));
		} else if(name == "timespan") {
			node.setAttribute('checked', timeSpan == node.getAttribute("value"));
		}
	}
}

toggleClearCacheSetting: function(event) {
	var prefName = event.target.getAttribute("pref");
	var prefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
	prefs.setBoolPref(prefName, !prefs.getBoolPref(prefName));
}

setClearCacheTime: function(event) {
	var timePeriod = event.target.getAttribute("value");
	var prefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
	prefs.setIntPref('clear-cache.timeSpan', timePeriod);
}