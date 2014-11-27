homePageStrings: function() {
	var stringBundle = toolbar_buttons.interfaces.StringBundleService
	.createBundle("chrome://{{chrome_name}}/locale/button.properties");
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

homePageChangeMultiple: function() {
	var prefs = toolbar_buttons.interfaces.PrefBranch;
	var strings = toolbar_buttons.homePageStrings();
	var value = prefs.getCharPref("browser.startup.homepage");
	var str = value.split("|");
	var links = "";
	
	Components.utils.import("resource://gre/modules/SharedPromptUtils.jsm");
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
	var i = 0;
	do {		
		if (str[i] != null) {
			args["value"] = str[i];
		} else {
			args["value"] = "http://";
		}
		var propBag = PromptUtils.objectToPropBag(args);
		window.openDialog("chrome://global/content/commonDialog.xul", "", "chrome, dialog, modal, centerscreen", propBag);
		var value = propBag.getPropertyAsAString('value');
		var button = propBag.getPropertyAsInt32('buttonNumClicked');
		alert(button);
		//if (button == 1) {
		//	return;
		//}
		if (value != "http://" && value != "") {
			if (links) {
				links += "|" + value;
			} else {
				links = value;
			}
		}
		i++;
	} while(button == 0);
	prefs.setCharPref("browser.startup.homepage", links);
}

homePageSetCurrent: function() {
	toolbar_buttons.interfaces.PrefBranch.setCharPref("browser.startup.homepage", window.content.document.location.href);
}

homePageAddCurrent: function() {
	var prefs = toolbar_buttons.interfaces.PrefBranch;
	var homePage = prefs.getCharPref("browser.startup.homepage");
	if(homePage)
		homePage += "|";
	homePage += window.content.document.location.href;
	prefs.setCharPref("browser.startup.homepage", homePage);
}

homeList: function(item) {
	var command = document.getElementById("homePageSeperator");
	while (item.lastChild != command) {
		item.removeChild(item.lastChild);
	}
	var prefs = toolbar_buttons.interfaces.PrefBranch;
	var links = prefs.getCharPref("browser.startup.homepage");
	var str = links.split("|");
	for (var i = 0; str[i] != null; i++) {
		var menuitem = document.createElement("menuitem");
		menuitem.setAttribute("label", str[i]);
		var url = str[i];
		menuitem.addEventListener("click", function(event) {
			toolbar_buttons.LoadURL(url, event);
		}, false);
		item.appendChild(menuitem);
	}
}