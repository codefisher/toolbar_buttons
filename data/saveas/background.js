function savePageAs() {
	let querying = browser.tabs.query({active: true});
	querying.then(goSaveTab, onError);
}

function goSaveTab(tabs) {
	name = tabs[0].title.replace('/', '') + ".html";
	browser.downloads.download({
		url: tabs[0].url,
		saveAs: true,
		filename: name,
	});
}

function onError(error) {
  console.log(`Error: ${error}`);
}

browser.browserAction.onClicked.addListener(savePageAs);