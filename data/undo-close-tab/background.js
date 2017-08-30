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


