homePageStrings: function() {
	var stringBundle = toolbar_buttons.interfaces.StringBundleService
	.createBundle("chrome://{{chrome_name}}/locale/{{locale_file_prefix}}button.properties");
	return {
		'title': stringBundle.GetStringFromName("home-page.title"),
		'message': stringBundle.GetStringFromName("home-page.message"),
		'next': stringBundle.GetStringFromName("next"),
		'done': stringBundle.GetStringFromName("done"),
	};
}

homePageChange: function() {
	var prefs = toolbar_buttons.interfaces.PrefBranch;
	var strings = toolbar_buttons.homePageStrings();
	var value = prefs.getCharPref("browser.startup.homepage");
	var str = value.split("|");
	var input = {value: str[0]};
	var result = toolbar_buttons.interfaces.PromptService.prompt(null, strings["title"], strings["message"], input, null, {check: false});
	if (result)
		prefs.setCharPref("browser.startup.homepage", input.value);
}

homePageChangeMultiple: function(event) {
	var win = event.target.ownerDocument.defaultView;
	var prefs = toolbar_buttons.interfaces.PrefBranch;
	var strings = toolbar_buttons.homePageStrings();
	var value = prefs.getCharPref("browser.startup.homepage");
	var str = value.split("|");
	var links = "";
	
	//var bunService = Cc["@mozilla.org/intl/stringbundle;1"].getService(Ci.nsIStringBundleService);
	//var bundle = bunService.createBundle("chrome://global/locale/commonDialogs.properties");
	
	var args = {
		promptType: "prompt",
		value: "http://",
		title: strings["title"],
		text: strings["message"],
		button0Label: strings["next"],
		//button1Label: bundle.GetStringFromName("Cancel"),
		button1Label: strings["done"],
	};
	var i = 0, button = null;
	do {		
		if (str[i] != null) {
			args["value"] = str[i];
		} else {
			args["value"] = "http://";
		}
		var propBag = PromptUtils.objectToPropBag(args);
		win.openDialog("chrome://global/content/commonDialog.xul", "", "chrome, dialog, modal, centerscreen", propBag);
		var value = propBag.getPropertyAsAString('value');
		button = propBag.getPropertyAsInt32('buttonNumClicked');
		if (value != "http://" && value != "") {
			if (links) {
				links += "|" + value;
			} else {
				links = value;
			}
		}
		i++;
	} while(button === 0);
	prefs.setCharPref("browser.startup.homepage", links);
}

homePageSetCurrent: function(event) {
	var win = event.target.ownerDocument.defaultView;
	toolbar_buttons.interfaces.PrefBranch.setCharPref("browser.startup.homepage", win.content.document.location.href);
}

homePageAddCurrent: function(event) {
	var win = event.target.ownerDocument.defaultView;
	var prefs = toolbar_buttons.interfaces.PrefBranch;
	var homePage = prefs.getCharPref("browser.startup.homepage");
	if(homePage)
		homePage += "|";
	homePage += win.content.document.location.href;
	prefs.setCharPref("browser.startup.homepage", homePage);
}

homeList: function(item) {
	while (item.lastChild.id != "homePageSeperator") {
		item.removeChild(item.lastChild);
	}
	var homepage = toolbar_buttons.interfaces.PrefBranch.getComplexValue("browser.startup.homepage",
						Ci.nsIPrefLocalizedString).data;
	var urls = homepage.split("|");
	for (var i in urls) {
		toolbar_buttons.createHomePageMenuItem(item, urls[i]);
	}
}

createHomePageMenuItem: function(item, url) {
	var doc = item.ownerDocument;
	var win = doc.defaultView;
	var menuitem = doc.createElement("menuitem");
	menuitem.setAttribute("label", url);
	menuitem.addEventListener("command", function() {
		win.loadURI(url);
	}, false);
	menuitem.addEventListener("click", function(event) {
		toolbar_buttons.openPageTab(url, event);
	}, false);
	item.appendChild(menuitem);
}
