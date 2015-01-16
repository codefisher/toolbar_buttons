loadAllMenusMenu: function(item) {
	if (item.firstChild) {
		return;
	}
	var menubar = document.getElementById('main-menubar');
	if(!menubar) {
		menubar = document.getElementById('mail-toolbar-menubar2'); // Thunderbird
	}
	if(!menubar) {
		return;
	}
	for (var i = 0; i < menubar.childNodes.length; i++) {
		item.appendChild(menubar.childNodes[i].cloneNode(true));
	}
}
