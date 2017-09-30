async function stopAllTabs() {
    try {
        let query = {
            currentWindow: true
        };
        let tabs = await browser.tabs.query(query);
        for (let tab of tabs) {
            browser.tabs.executeScript(tab.id, {
                code: "window.stop();",
                allFrames: true,
                runAt: "document_start"
            });
        }
    } catch (error) {
        console.log(`Error: ${error}`);
    }
}

browser.browserAction.onClicked.addListener(stopAllTabs);