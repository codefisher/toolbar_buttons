async function closeOtherTabs() {
    try {
        let settings = await browser.storage.local.get({
            not_pinned: true,
        });
        let query = {
            currentWindow: true,
            active: false,
        };
        if (settings.not_pinned) {
            query.pinned = false;
        }
        let tabs = await browser.tabs.query(query);
        for (let tab of tabs) {
            browser.tabs.remove(tab.id);
        }
    } catch (error) {
        console.log(`Error: ${error}`);
    }
}

browser.browserAction.onClicked.addListener(closeOtherTabs);