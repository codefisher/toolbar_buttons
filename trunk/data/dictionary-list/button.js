addDictionaryList: function(item) {
	while (item.firstChild) {
		item.removeChild(item.firstChild);
	}
	try {
		var prefs = toolbar_buttons.interfaces.PrefBranch;
		var current = prefs.getCharPref("spellchecker.dictionary");
		var spellclass = "@mozilla.org/spellchecker/myspell;1";
		if ("@mozilla.org/spellchecker/hunspell;1" in Components.classes) {
			spellclass = "@mozilla.org/spellchecker/hunspell;1";
		} else if ("@mozilla.org/spellchecker/engine;1" in Components.classes) {
			spellclass = "@mozilla.org/spellchecker/engine;1";
		}
		var spellchecker = Cc[spellclass].createInstance(Ci.mozISpellCheckingEngine);
		var editorSpellChecker = Components.classes['@mozilla.org/editor/editorspellchecker;1'].createInstance(Components.interfaces.nsIEditorSpellCheck);
		
		var o1 = {};
		var o2 = {};
		
		spellchecker.getDictionaryList(o1, o2);
		var dictList = o1.value;
		var count    = o2.value;
		
		var languageBundle = toolbar_buttons.interfaces.StringBundleService
			.createBundle("chrome://global/locale/languageNames.properties");
		var regionBundle = toolbar_buttons.interfaces.StringBundleService
			.createBundle("chrome://global/locale/regionNames.properties");
		var i = 0;
		for (i = 0; i < count; i++) {
			var menuitem = document.createElement("menuitem");
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
				prefs.setCharPref("spellchecker.dictionary", this.language);
				try {
					editorSpellChecker.SetCurrentDictionary(this.language);
				} catch(e) {}
			}, false);
			item.appendChild(menuitem);
		}
	} catch(e) {
		menuitem = document.createElement("menuitem");
		var stringBundle = toolbar_buttons.interfaces.StringBundleService
			.createBundle("chrome://{{chrome_name}}/locale/button.properties");
		var empty = stringBundle.GetStringFromName("empty");
		menuitem.setAttribute("label", empty);
		menuitem.setAttribute("disabled", true);
		item.appendChild(menuitem);
	}
}
getDictionaryName: function(langId, languageBundle, regionBundle) {
	// copied out of Firefox, with minor change to use GetStringFromName
    try
    {
      isoStrArray = langId.split(/[-_]/);

      if (languageBundle && isoStrArray[0])
        langLabel = languageBundle.GetStringFromName(isoStrArray[0].toLowerCase());

      if (regionBundle && langLabel && isoStrArray.length > 1 && isoStrArray[1])
      {
        menuStr2 = regionBundle.GetStringFromName(isoStrArray[1].toLowerCase());
        if (menuStr2)
          langLabel += "/" + menuStr2;
      }

      if (langLabel && isoStrArray.length > 2 && isoStrArray[2])
        langLabel += " (" + isoStrArray[2] + ")";

      if (!langLabel)
        langLabel = langId;
    }
    catch (ex)
    {
      // getString throws an exception when a key is not found in the
      // bundle. In that case, just use the original dictList string.
      langLabel = langId;
    }
    return langLabel;
}
