socialMediaShare: function(event, service) {
	var win = event.target.ownerDocument.defaultView;
	var title = win.encodeURIComponent(win.gBrowser.selectedBrowser.contentTitle);
	var href = win.gBrowser.selectedBrowser.contentDocument.location.href;
	var uri = win.encodeURIComponent(href);
	switch(service) {
		case "twitter":
			url = "https://twitter.com/intent/tweet?text=" + title + "&url=" + uri;
			break;
		case "facebook":
			url = "https://www.facebook.com/sharer/sharer.php?t=" + title + "&u=" + uri;
			break;
		case "googleplus":
			url = "https://plus.google.com/share?url=" + uri;
			break;
		case "linkedin":
			url = "hhttps://www.linkedin.com/shareArticle?mini=true&title=" + title + "&url=" + uri;
			break;
		case "reddit":
			url = "http://www.reddit.com/submit?title=" + title + "&url=" + uri;
			break;
		default:
			return;
	}
	var tab = win.gBrowser.addTab(url, {owner: win.gBrowser.selectedTab, relatedToCurrent: true});
	win.gBrowser.selectedTab = tab;
}
