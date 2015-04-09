hideURLText: function(item) {
	var doc = item.ownerDocument;
	var urlbar = doc.getElementById("urlbar");
	var comStyle = doc.defaultView.getComputedStyle(urlbar, "").getPropertyValue("background-color");
	if (urlbar.style.color == comStyle) {
		item.checked = false;
		urlbar.style.color = "";
	} else {
		item.checked = true;
		urlbar.style.color = comStyle;
	}
	return false;
}