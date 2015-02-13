goFirstLastTab: function() {
	var browser = window.getBrowser();
	if(browser.selectedTab == browser.tabs[0]) {
		browser.selectedTab = browser.tabs[browser.tabs.length-1];
	} else {
		browser.selectedTab = browser.tabs[0];
	}
}
