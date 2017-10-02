browser.browserAction.onClicked.addListener(async function () {
    let tabs = await browser.tabs.query({
        currentWindow: true,
        active: true
    });
    if(tabs.length > 0) {
        browser.tabs.update(tabs[0].id, {pinned: !tabs[0].pinned});
    }
});