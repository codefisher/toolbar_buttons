function colorPicker() {
	browser.tabs.create({
		url: '/files/colorpicker.html',
		active: true,
	});
}

browser.browserAction.onClicked.addListener(colorPicker);