socialMediaShare: function(service) {
	var title = window.encodeURIComponent(window.gBrowser.selectedBrowser.contentTitle);
	var href = window.gBrowser.selectedBrowser.contentDocument.location.href;
	var uri = window.encodeURIComponent(href);
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
	var tab = window.gBrowser.addTab(url, {owner: window.gBrowser.selectedTab, relatedToCurrent: true});
	window.gBrowser.selectedTab = tab;
}
