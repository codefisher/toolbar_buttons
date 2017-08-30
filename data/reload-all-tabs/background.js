async function reloadAllTabs() {
    try {
        let settings = await browser.storage.local.get({
            bypass_cache: false,
        });
        let query = {
            currentWindow: true
        };
        let tabs = await browser.tabs.query(query);
        for (let tab of tabs) {
            browser.tabs.reload(tab.id, {
                bypassCache: settings.bypass_cache
            });
        }
    } catch (error) {
        console.log(`Error: ${error}`);
    }
}

browser.browserAction.onClicked.addListener(reloadAllTabs);