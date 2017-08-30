async function closeAllTabs() {
    try {
        let settings = await browser.storage.local.get({
            not_current: false,
            not_pinned: true,
        });
        let query = {
            currentWindow: true
        };
        if (settings.not_pinned) {
            query.pinned = false;
        }
        if (settings.not_current) {
            query.active = false;
        }
        let tabs = await browser.tabs.query(query);
        if (!settings.not_current) {
            let pinned = await browser.tabs.query({
                currentWindow: true,
                pinned: true
            });
            if(pinned.length === 0 || settings.not_pinned === false) {
                browser.tabs.create({});
            }
        }
        for (let tab of tabs) {
            browser.tabs.remove(tab.id);
        }
    } catch (error) {
        console.log(`Error: ${error}`);
    }
}

browser.browserAction.onClicked.addListener(closeAllTabs);