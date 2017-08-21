function openAboutConfig() {
	browser.tabs.create({
		url: 'about:config',
		active: true,
	});
}

browser.browserAction.onClicked.addListener(openAboutConfig);