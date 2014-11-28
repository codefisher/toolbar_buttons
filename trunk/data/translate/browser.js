TranslatePage: function() {
	var to = toolbar_buttons.interfaces.ExtensionPrefBranch.getCharPref("translate.lang");
	var translator = toolbar_buttons.interfaces.ExtensionPrefBranch.getCharPref("translate.service");
	
	if(translator == "bing") {
		var doc = getBrowser().contentDocument;
		var script = doc.createElement('script');
		script.type = 'text/javascript';
		script.src = 'http://labs.microsofttranslator.com/bookmarklet/default.aspx?f=js&to=' + to; 
		doc.body.insertBefore(script, doc.body.firstChild);	
	} else if(translator == "promt") {
			var pto = toolbar_buttons.interfaces.ExtensionPrefBranch.getCharPref("translate.promt");
		// this will not work yet, because we need the correct value for 'to'
		var targetURI = getWebNavigation().currentURI.spec;
		var service = 'http://www.online-translator.com/siteTranslation/autolink/?direction=' + pto + '&template=General&sourceURL=' + encodeURIComponent(targetURI)
		loadURI(service);
	} else {
		var service = "http://translate.google.com/translate?u=";
		var targetURI = getWebNavigation().currentURI.spec;
		var langs = "&tl=" + to;
		if (targetURI.indexOf("translate.google.com") > 0 ||
				targetURI.indexOf("64.233.179") > 0) {
			BrowserReload();
		} else {
			loadURI(service + encodeURIComponent(targetURI) + langs);
		}
	}
}
