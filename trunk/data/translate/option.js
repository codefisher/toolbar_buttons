loadTranslate: function() {
	dump('loadTranslate');
	var XMLhttp = new XMLHttpRequest();
	XMLhttp.open("GET", "https://translate.google.com/");
	XMLhttp.onload = toolbar_buttons.loadTranslateOnload;
	XMLhttp.send(null);
}

loadTranslateOnload: function(XMLhttp) {
	if(XMLhttp.target.readyState != 4 && XMLhttp.target.status != 200) {
		return;
	}
	var currentValue = toolbar_buttons.interfaces.ExtensionPrefBranch.getCharPref("translate.lang");
	var data = XMLhttp.target.responseText.match(/<select[^>]*name=tl[^>]*>.*?<\/select>/);
	var languages = {};
	var items = data.toString().match(/<option.*?value="?[^>"]+"?>.*?<\/option>/g);
	var menu = document.getElementById('translate-languages-popup');
	while(menu.firstChild) {
		menu.removeChild(menu.firstChild);
	}
	var menulist = document.getElementById('translate-languages-menu');
	for(item in items) {
		var lang = items[item].toString().match(/<option.*?value="?([^>"]+)"?.*?>(.*?)<\/option>/);
		var menuItem = document.createElement("menuitem");
		menuItem.setAttribute("value", lang[1]);
		menuItem.setAttribute("label", lang[2] + " (" + lang[1] + ")");
		menu.appendChild(menuItem);
		if(lang[1] == currentValue) {
			menuItem.setAttribute("selected", "true");
			menulist.selectedItem = menuItem;
		}
	}
	menulist.removeAttribute('disabled');
}

window.addEventListener("load", toolbar_buttons.loadTranslate, false);
