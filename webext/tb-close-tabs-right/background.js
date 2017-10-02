async function closeAllTabs() {
    try {
        let settings = await browser.storage.local.get({
            not_pinned: true,
        });
        let query = {
            currentWindow: true
        };
        if (settings.not_pinned) {
            query.pinned = false;
        }
        let tabs = await browser.tabs.query(query);
        let active_seen = false;
        for (let tab of tabs) {
            if(active_seen) {
                browser.tabs.remove(tab.id);
            } else {
                if(tab.active) {
                    active_seen = true;
                }
            }
        }
    } catch (error) {
        console.log(`Error: ${error}`);
    }
}

browser.browserAction.onClicked.addListener(closeAllTabs);