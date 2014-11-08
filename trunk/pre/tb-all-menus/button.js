loadAllMenusMenu: function(item) {
	if (item.firstChild) {
		return;
	}
	var menubar = document.getElementById('main-menubar');
	for (var i = 0; i < menubar.childNodes.length; i++) {
		item.appendChild(menubar.childNodes[i].cloneNode(true));
	}
}
