function closeAllTabs() {
	var querying = browser.tabs.query({
		pinned: false,
		currentWindow: true
	});
	querying.then(removeTabs, onError);
}

function removeTabs(tabs) {
	browser.tabs.create({});
	for (let tab of tabs) {
		browser.tabs.remove(tab.id);
	}
}

function onError(error) {
	console.log(`Error: ${error}`);
}

browser.browserAction.onClicked.addListener(closeAllTabs);