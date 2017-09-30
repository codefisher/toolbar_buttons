browser.browserAction.onClicked.addListener(function(tab) {
    browser.tabs.printPreview();
});