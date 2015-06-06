openFindBar: function(event) {
	var win = event.target.ownerDocument.defaultView;
	if('gFindBar' in win) { // Firefox
		if(win.gFindBar.hidden) {
			win.gFindBar.open();
		} else {
			win.gFindBar.close();
		}
	} else { // SeaMonkey
		var findBar = win.document.getElementById("FindToolbar");
		if(findBar.hidden) {
			win.BrowserFind();
		} else {
			findBar.close();
		}
	}
}