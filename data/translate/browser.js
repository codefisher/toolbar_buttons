TranslatePage: function(event) {
	var win = event.target.ownerDocument.defaultView;
	var to = toolbar_buttons.interfaces.ExtensionPrefBranch.getCharPref("translate.lang");
	var translator = toolbar_buttons.interfaces.ExtensionPrefBranch.getCharPref("translate.service");
	
	/*if(translator == "bing") {
		var doc = win.getBrowser().contentDocument;
		var script = doc.createElement('script');
		script.type = 'text/javascript';
		script.src = 'http://labs.microsofttranslator.com/bookmarklet/default.aspx?f=js&to=' + to; 
		doc.body.insertBefore(script, doc.body.firstChild);	
	} else*/ if(translator == "promt") {
		var pto = toolbar_buttons.interfaces.ExtensionPrefBranch.getCharPref("translate.promt");
		var targetURI = win.getWebNavigation().currentURI.spec;
		var service = 'http://www.online-translator.com/siteTranslation/autolink/?direction=' + pto + '&template=General&sourceURL=' + encodeURIComponent(targetURI);
		win.loadURI(service);
	} else {
		var service = "http://translate.google.com/translate?u=";
		var targetURI = win.getWebNavigation().currentURI.spec;
		var langs = "&tl=" + to;
		if (targetURI.indexOf("translate.google.com") > 0 ||
				targetURI.indexOf("64.233.179") > 0) {
			win.BrowserReload();
		} else {
			win.loadURI(service + encodeURIComponent(targetURI) + langs);
		}
	}
}
