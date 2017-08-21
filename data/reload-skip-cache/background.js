function reloadSkipCache() {
	browser.tabs.reload({bypassCache: true});
}

browser.browserAction.onClicked.addListener(reloadSkipCache);