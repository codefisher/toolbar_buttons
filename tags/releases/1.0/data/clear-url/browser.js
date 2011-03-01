hideURLText: function(item) {
	var urlbar = document.getElementById("urlbar");
	var comStyle = document.defaultView.getComputedStyle(urlbar, "").getPropertyValue("background-color");
	if (urlbar.style.color == comStyle) {
		item.checked = false;
		urlbar.style.color = "";
	} else {
		item.checked = true;
		urlbar.style.color = comStyle;
	}
	return false;
}