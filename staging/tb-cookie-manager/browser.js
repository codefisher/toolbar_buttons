openCookieTab: function() {
	var newPage = getBrowser().addTab("chrome://browser/content/preferences/cookies.xul");
	getBrowser().selectedTab = newPage;
}
