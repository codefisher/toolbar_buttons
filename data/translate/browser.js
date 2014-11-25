TranslatePage: function() {
	var service = "http://translate.google.com/translate?u=";
	var targetURI = getWebNavigation().currentURI.spec;
	var to = toolbar_buttons.interfaces.ExtensionPrefBranch.getCharPref("translate.lang");
	var langs = "&tl=" + to;
	if (targetURI.indexOf("translate.google.com") > 0 ||
			targetURI.indexOf("64.233.179") > 0) {
		BrowserReload();
	} else {
		loadURI(service + encodeURIComponent(targetURI) + langs);
	}
}

UpdateTranslateOverlay: function() {
	if(!document.getElementById('translate'))
		return;

	var file = toolbar_buttons.interfaces.Properties.get("ProfD", Ci.nsIFile);
	file.append("tb-translate-options.xul");
	if(!file.exists() || ((new Date()).getTime() - file.lastModifiedTime) > 1000*60*60*24*7) {
		var XMLhttp = new XMLHttpRequest();
		XMLhttp.open("GET", "https://translate.google.com/");
		XMLhttp.onload = toolbar_buttons.UpdateTranslateOverlayOnload;
		XMLhttp.send(null);
	}
}

UpdateTranslateOverlayOnload: function(XMLhttp) {
	var data = XMLhttp.target.responseText.match(/<select[^>]*name=tl[^>]*>.*?<\/select>/);
	var languages = {};
	var items = data.toString().match(/<option.*?value="?[^>"]+"?>.*?<\/option>/g);
	var xul = '<?xml version="1.0"?><overlay id="translate-options" xmlns="http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"><menupopup id="translate-languages">';
	for(item in items) {
		var lang = items[item].toString().match(/<option.*?value="?([^>"]+)"?.*?>(.*?)<\/option>/);
		xul += '<menuitem value="' + lang[1] + '" label="' + lang[2] + '"/>\n';
	}
	xul += '</menupopup><menulist id="translate-languages-menu-dummy" hidden="true"/><menulist id="translate-languages-menu" hidden="false" /></overlay>';

	var file = toolbar_buttons.interfaces.Properties.get('ProfD', Ci.nsIFile);
	file.append("tb-translate-options.xul");
	var foStream = toolbar_buttons.interfaces.FileOutputStream();
	foStream.init(file, 0x02 | 0x08 | 0x20, 0664, 0);
	foStream.write(xul, xul.length);
	foStream.close();
}

window.addEventListener("load", toolbar_buttons.UpdateTranslateOverlay, false);