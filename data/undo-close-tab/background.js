var popup = "";

browser.browserAction.getPopup({}).then(function (popupUrl) {
    popup = popupUrl;
    browser.storage.local.get({
        hide_popup: true,
    }, function (items) {
        if (items.hide_popup) {
            browser.browserAction.setPopup({"popup": ""});
        }
    });
    browser.storage.onChanged.addListener(function (changes, areaName) {
        if (changes.hide_popup.newValue === true) {
            browser.browserAction.setPopup({"popup": ""});
        } else {
            browser.browserAction.setPopup({"popup": popup});
        }
    });
});

// note almost same function in panel.js
async function restoreAll() {
    let settings = await browser.storage.local.get({
        tab_count: 10,
    });
    let sessionInfos = await browser.sessions.getRecentlyClosed({
        maxResults: Math.min(settings.tab_count, browser.sessions.MAX_SESSION_RESULTS)
    });
    for(let sessionInfo of sessionInfos) {
        if (sessionInfo.tab) {
            browser.sessions.restore(sessionInfo.tab.sessionId);
        } else {
            browser.sessions.restore(sessionInfo.window.sessionId);
        }
    }
}

async function setUpTabMenu() {
    let settings = await browser.storage.local.get({
        tab_count: 10
    });
    let sessionInfos = await browser.sessions.getRecentlyClosed({
        maxResults: Math.min(settings.tab_count, browser.sessions.MAX_SESSION_RESULTS)
    });
    browser.menus.removeAll();
    if (sessionInfos.length) {
        for(let sessionInfo of sessionInfos) {
            let text;
            let icon;
            if (sessionInfo.tab) {
                text = sessionInfo.tab.title;
                 if(sessionInfo.tab.favIconUrl) {
                    icon = {"16": sessionInfo.tab.favIconUrl};
                 }
            } else {
                let windowTabs = sessionInfo.window.tabs;
                let tab = windowTabs[0];
                for(let windowTab of windowTabs) {
                    if (windowTab.active || windowTab.selected) {
                        tab = windowTab;
                    }
                }
                if (windowTabs.length === 1) {
                    text = tab.title;
                } else if (windowTabs.length === 2) {
                    text = browser.i18n.getMessage("undoCloseTabWindowTab", tab.title);
                } else {
                    text = browser.i18n.getMessage("undoCloseTabWindowTabs", tab.title, (windowTabs.length - 1));
                }
            }
            function callBack(info) {
                return function() {
                    if(info.tab) {
                        browser.sessions.restore(info.tab.sessionId);
                    } else {
                        browser.sessions.restore(info.window.sessionId);
                    }
                }
            }
            browser.menus.create({
                title: text,
                onclick: callBack(sessionInfo),
                icons: icon,
                contexts: ["tab"]
            });
        }
    }
    browser.menus.create({
        id: "separator",
        type: "separator",
        contexts: ["tab"]
    });
    browser.menus.create({
        id: "restore-all",
        title: browser.i18n.getMessage("undoCloseTabRestoreAll"),
        onclick: restoreAll,
        contexts: ["tab"]
    });
}

browser.sessions.onChanged.addListener(setUpTabMenu);
// call for the first time
setUpTabMenu();


function restoreMostRecent(sessionInfos) {
    if (!sessionInfos.length) {
        console.log("No sessions found")
        return;
    }
    let sessionInfo = sessionInfos[0];
    if (sessionInfo.tab) {
        browser.sessions.restore(sessionInfo.tab.sessionId);
    } else {
        browser.sessions.restore(sessionInfo.window.sessionId);
    }
}

function onError(error) {
    console.log(error);
}

browser.browserAction.onClicked.addListener(function () {
    browser.storage.local.get({
        hide_popup: true,
    }, function (items) {
        if (items.hide_popup) {
            var gettingSessions = browser.sessions.getRecentlyClosed({
                maxResults: 1
            });
            gettingSessions.then(restoreMostRecent, onError);
        }
    });
});


