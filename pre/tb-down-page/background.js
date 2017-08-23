browser.browserAction.onClicked.addListener(function() {
	browser.tabs.executeScript({
		"code": "window.scrollTo(0, document.documentElement.scrollTop + document.documentElement.clientHeight - 50);"
	});
});