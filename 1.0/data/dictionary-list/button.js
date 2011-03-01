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
		var list = [];
		spellchecker.getDictionaryList(list, {});
		var i = 0;
		list = list.value.toString().split(",");
		while (list[i]) {
			var menuitem = document.createElement("menuitem");
			var language = list[i];
			if (language == current) {
				menuitem.style.fontWeight = "900";
				menuitem.setAttribute("checked", true);
			}
			menuitem.setAttribute("name", "dictionary");
			menuitem.setAttribute("type", "radio");
			menuitem.setAttribute("label", language);
			menuitem.language = language;
			menuitem.addEventListener("command", function() {
				prefs.setCharPref("spellchecker.dictionary", this.language);
			}, false);
			item.appendChild(menuitem);
			i++;
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