addDictionaryList: function(item) {
	var doc = item.ownerDocument;
	while (item.firstChild && item.firstChild.nodeName != 'menuseparator') {
		item.removeChild(item.firstChild);
	}
	var sep = item.firstChild;
	try {
		var prefs = toolbar_buttons.interfaces.PrefBranch;
		var current = prefs.getCharPref("spellchecker.dictionary");
		var spellclass = "@mozilla.org/spellchecker/myspell;1";
		if ("@mozilla.org/spellchecker/hunspell;1" in Cc) {
			spellclass = "@mozilla.org/spellchecker/hunspell;1";
		} else if ("@mozilla.org/spellchecker/engine;1" in Cc) {
			spellclass = "@mozilla.org/spellchecker/engine;1";
		}
		var spellchecker = Cc[spellclass].createInstance(Ci.mozISpellCheckingEngine);
		var editorSpellChecker = Cc['@mozilla.org/editor/editorspellchecker;1'].createInstance(Ci.nsIEditorSpellCheck);
		
		var o1 = {};
		var o2 = {};
		
		spellchecker.getDictionaryList(o1, o2);
		var dictList = o1.value;
		var count	= o2.value;
		
		var languageBundle = toolbar_buttons.interfaces.StringBundleService
			.createBundle("chrome://global/locale/languageNames.properties");
		var regionBundle = toolbar_buttons.interfaces.StringBundleService
			.createBundle("chrome://global/locale/regionNames.properties");

		for (var i = 0; i < count; i++) {
			var menuitem = doc.createElement("menuitem");
			var language = dictList[i];
			if (language == current) {
				menuitem.style.fontWeight = "900";
				menuitem.setAttribute("checked", true);
			}
			menuitem.setAttribute("name", "dictionary");
			menuitem.setAttribute("type", "radio");
			menuitem.setAttribute("label", toolbar_buttons.getDictionaryName(language, languageBundle, regionBundle));
			menuitem.language = language;
			menuitem.addEventListener("command", function() {				
				 // this is done by SetCurrentDictionary so if that works, this is not needed
				 prefs.setCharPref("spellchecker.dictionary", this.language);
			}, false);
			item.insertBefore(menuitem, sep);
		}
	} catch(e) {
		var menuitem = doc.createElement("menuitem");
		var stringBundle = toolbar_buttons.interfaces.StringBundleService
			.createBundle("chrome://{{chrome_name}}/locale/{{locale_file_prefix}}button.properties");
		var empty = stringBundle.GetStringFromName("empty");
		menuitem.setAttribute("label", empty);
		menuitem.setAttribute("disabled", true);
		item.insertBefore(menuitem, sep);
	}
}

getDictionaryName: function(langId, languageBundle, regionBundle) {
	// copied out of Firefox, with minor change to use GetStringFromName
	var langLabel;
	try	{
		var isoStrArray = langId.split(/[-_]/);
		if (languageBundle && isoStrArray[0]) {
			langLabel = languageBundle.GetStringFromName(isoStrArray[0].toLowerCase());
		}

		if (regionBundle && langLabel && isoStrArray.length > 1 && isoStrArray[1]) {
			var menuStr2 = regionBundle.GetStringFromName(isoStrArray[1].toLowerCase());
			if (menuStr2) {
				langLabel += "/" + menuStr2;
			}
		}

		if (langLabel && isoStrArray.length > 2 && isoStrArray[2]) {
			langLabel += " (" + isoStrArray[2] + ")";
		}
	
		if (!langLabel) {
			langLabel = langId;
		}
	} catch (ex) {
		// getString throws an exception when a key is not found in the
		// bundle. In that case, just use the original dictList string.
		langLabel = langId;
	}
	return langLabel;
}

// copied off the context menu 
addDictionaries: function(event) {
	var win = event.target.ownerDocument.defaultView;
	var uri = win.formatURL("browser.dictionaries.download.url", true);

	var locale = "-";
	try {
	  locale = win.gPrefService.getComplexValue("intl.accept_languages", Ci.nsIPrefLocalizedString).data;
	}
	catch (e) { }

	var version = "-";
	try {
	  version = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo).version;
	}
	catch (e) { }

	uri = uri.replace(/%LOCALE%/, win.escape(locale)).replace(/%VERSION%/, version);

	var newWindowPref = win.gPrefService.getIntPref("browser.link.open_newwindow");
	var where = newWindowPref == 3 ? "tab" : "window";

	win.openUILinkIn(uri, where);
}
