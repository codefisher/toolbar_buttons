#include LoadURL

homePageStrings: function() {
	var stringBundle = toolbar_button_interfaces.StringBundleService
	.createBundle("chrome://{{chrome_name}}/locale/button.properties");
	return {
		'title': stringBundle.GetStringFromName("home-page.title"),
		'message': stringBundle.GetStringFromName("home-page.message"),
		'next': stringBundle.GetStringFromName("next"),
		'done': stringBundle.GetStringFromName("done")
	}
}

homePageChange: function() {
	var prefs = toolbar_button_interfaces.PrefBranch;
	var strings = toolbar_buttons.homePageStrings();
	var value = prefs.getCharPref("browser.startup.homepage");
	var str = value.split("|");
	var input = {value: str[0]};
	var result = toolbar_button_interfaces.PromptService.prompt(null, strings["title"], strings["message"], input, null, {check: false});
	if (result)
		prefs.setCharPref("browser.startup.homepage", input.value);
}

homePageChangeMultiple: function() {
	var prefs = toolbar_button_interfaces.PrefBranch;
	var args = toolbar_button_interfaces.DialogParamBlock;
	var strings = toolbar_buttons.homePageStrings();
	var value = prefs.getCharPref("browser.startup.homepage");
	var str = value.split("|");
	var links = "";
	var i = 0;

	args.SetInt(2, 3);
	args.SetInt(3, 1);
	args.SetString(8, strings["next"]);
	args.SetString(10, strings["done"]);
	args.SetInt(0, 0);
	args.SetString(12, strings["title"]);
	args.SetString(4, strings["message"]);
	while (args.GetInt(0) == 0) {
		if (str[i] != null) {
			args.SetString(6, str[i]);
		} else {
			args.SetString(6, "http://");
		}
		var arg2 = Array();
		arg2.returnbutton2 = true;
		window.openDialog("chrome://global/content/commonDialog.xul", "", "chrome, dialog, modal", args, arg2);
		if (args.GetInt(0) == 1) {
			return;
		}
		if (args.GetString(6) != "http://" && args.GetString(6) != "") {
			if (args.GetInt(0) == 0) {
				links += args.GetString(6) + "|";
			} else {
				links += args.GetString(6);
			}
		}
		i++;
	}
	prefs.setCharPref("browser.startup.homepage", links);
}

homePageSetCurrent: function() {
	toolbar_button_interfaces.PrefBranch.setCharPref("browser.startup.homepage", window.content.document.location.href)
}

homePageAddCurrent: function() {
	var prefs = toolbar_button_interfaces.PrefBranch;
	var homePage = prefs.getCharPref("browser.startup.homepage");
	if(homePage)
		homePage += "|";
	homePage += window.content.document.location.href;
	prefs.setCharPref("browser.startup.homepage", homePage)
}

homeList: function(item) {
	var command = document.getElementById("homePageSeperator");
	while (item.lastChild != command) {
		item.removeChild(item.lastChild);
	}
	var prefs = toolbar_button_interfaces.PrefBranch;
	var links = prefs.getCharPref("browser.startup.homepage");
	var str = links.split("|");
	for (var i = 0; str[i] != null; i++) {
		var menuitem = document.createElement("menuitem");
		menuitem.setAttribute("label", str[i]);
		item.addEventListener("click", function(event) {
			toolbar_buttons.LoadURL(str[i], event);
		}, false);
		item.appendChild(menuitem);
	}
}