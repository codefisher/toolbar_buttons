browser.browserAction.onClicked.addListener(function(tab) {
    browser.tabs.remove(tab.id);
});