goFirstLastTab: function(event) {
	var win = event.target.ownerDocument.defaultView;
	var browser = win.getBrowser();
	if(browser.selectedTab == browser.tabs[0]) {
		browser.selectedTab = browser.tabs[browser.tabs.length-1];
	} else {
		browser.selectedTab = browser.tabs[0];
	}
}
