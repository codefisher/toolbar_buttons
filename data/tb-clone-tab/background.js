async function cloneTab() {
    let tabs = await browser.tabs.query({
        active: true,
        currentWindow: true
    });
    if(tabs.length > 0) {
        browser.tabs.duplicate(tabs[0].id);
    }
}

browser.browserAction.onClicked.addListener(cloneTab);