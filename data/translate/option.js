loadTranslate: function() {
	var currentValue = toolbar_buttons.interfaces.ExtensionPrefBranch.getCharPref("translate.lang");
	var promtValue = toolbar_buttons.interfaces.ExtensionPrefBranch.getCharPref("translate.promt");

	var menulist = document.getElementById('translate-languages-menu');
	var promtlist = document.getElementById('translate-languages-promt');
		
	var loading = document.getElementById('translate-loading');
	loading.setAttribute('value', currentValue);
	menulist.selectedItem = loading;
	var promtLoading = document.getElementById('translate-promt-loading');
	promtLoading.setAttribute('value', promtValue);
	promtlist.selectedItem = promtLoading;
	
	var XMLhttp = new XMLHttpRequest();
	XMLhttp.open("GET", "https://translate.google.com/");
	XMLhttp.onload = toolbar_buttons.loadTranslateOnload;
	XMLhttp.send(null);
}

loadTranslateOnload: function(XMLhttp) {
	var currentValue = toolbar_buttons.interfaces.ExtensionPrefBranch.getCharPref("translate.lang");
	var promtValue = toolbar_buttons.interfaces.ExtensionPrefBranch.getCharPref("translate.promt");
	var service = toolbar_buttons.interfaces.ExtensionPrefBranch.getCharPref("translate.service");

	var menulist = document.getElementById('translate-languages-menu');
	var promtlist = document.getElementById('translate-languages-promt');
		
	if(XMLhttp.target.readyState != 4 && XMLhttp.target.status != 200) {
		return;
	}
	
	var promt_values = ['ru', 'de', 'en', 'fr', 'es', 'it', 'pt'];
	var promt_setting = ['ar', 'ag', 'ae', 'af', 'as', 'ai', 'ap'];
		
	var data = XMLhttp.target.responseText.match(/<select[^>]*name=tl[^>]*>.*?<\/select>/);
	var languages = {};
	var items = data.toString().match(/<option.*?value="?[^>"]+"?>.*?<\/option>/g);
	var menu = document.getElementById('translate-languages-popup');
	var promt = document.getElementById('translate-promt-popup');
	while(menu.firstChild) {
		menu.removeChild(menu.firstChild);
	}
	while(promt.firstChild) {
		promt.removeChild(promt.firstChild);
	}
	for(var item in items) {
		var lang = items[item].toString().match(/<option.*?value="?([^>"]+)"?.*?>(.*?)<\/option>/);
		var menuItem = document.createElement("menuitem");
		menuItem.setAttribute("value", lang[1]);
		menuItem.setAttribute("label", lang[2] + " (" + lang[1] + ")");
		menu.appendChild(menuItem);
		if(lang[1] == currentValue) {
			menuItem.setAttribute("selected", "true");
			menulist.selectedItem = menuItem;
		}
		if(promt_values.indexOf(lang[1]) != -1) {
			var promtItem = document.createElement("menuitem");
			var value = promt_setting[promt_values.indexOf(lang[1])];
			promtItem.setAttribute("value", value);
			promtItem.setAttribute("label", lang[2] + " (" + lang[1] + ")");
			promt.appendChild(promtItem);
			if(value == promtValue) {
				promtItem.setAttribute("selected", "true");
				promtlist.selectedItem = promtItem;
			}
		}		
	}
	menulist.removeAttribute('disabled');
	promtlist.setAttribute('hidden', service != 'promt');
	menulist.setAttribute('hidden', service == 'promt');
}

showOtherTranslate: function() {
	var menulist = document.getElementById('translate-languages-menu');
	var promtlist = document.getElementById('translate-languages-promt');
	promtlist.setAttribute('hidden', true);
	menulist.setAttribute('hidden', false);
}

showPromtTranslate: function() {
	var menulist = document.getElementById('translate-languages-menu');
	var promtlist = document.getElementById('translate-languages-promt');
	promtlist.setAttribute('hidden', false);
	menulist.setAttribute('hidden', true);
}

window.addEventListener("load", toolbar_buttons.loadTranslate, false);
