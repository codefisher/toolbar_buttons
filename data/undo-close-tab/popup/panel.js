function restoreMostRecent(sessionInfos) {
    let tabs = document.getElementById('tabs');
	if (!sessionInfos.length) {
        let div = document.createElement('div');
        div.classList.add('button');
        div.classList.add('disabled');
        let text = document.createTextNode(browser.i18n.getMessage("undoCloseTabEmpty"));
        div.appendChild(text);
        tabs.appendChild(div);
        return;
    }
    let text = null;
	for(let sessionInfo of sessionInfos) {
        let div = document.createElement('div');
        div.classList.add('button');
        if (sessionInfo.tab) {
            if(sessionInfo.tab.favIconUrl) {
                div.classList.add('iconic');
                let img = document.createElement('img');
                img.setAttribute('src', sessionInfo.tab.favIconUrl);
                img.setAttribute('width', '16');
                img.setAttribute('height', '16');
                div.append(img);
            } else {
                div.classList.add('text');
            }
            text = document.createTextNode(sessionInfo.tab.title);
        } else {
            let windowTabs = sessionInfo.window.tabs;
            let tab = windowTabs[0];
            for(let windowTab of windowTabs) {
                if (windowTab.active || windowTab.selected) {
                    tab = windowTab;
                }
            }
            if (windowTabs.length === 1) {
                text = document.createTextNode(tab.title);
            } else if (windowTabs.length === 2) {
                text = document.createTextNode(browser.i18n.getMessage("undoCloseTabWindowTab", tab.title));
            } else {
                text = document.createTextNode(browser.i18n.getMessage("undoCloseTabWindowTabs", tab.title, (windowTabs.length - 1)));
            }
            div.classList.add('text');
        }
        div.appendChild(text);
        div.addEventListener('click', function() {
           if(sessionInfo.tab) {
               browser.sessions.restore(sessionInfo.tab.sessionId);
           } else {
               browser.sessions.restore(sessionInfo.window.sessionId);
           }
           window.close();
        });
        tabs.appendChild(div);
    }
}

function onError(error) {
	console.log(error);
}

async function restoreAll() {
    let settings = await browser.storage.local.get({
        tab_count: 10,
    });
    let sessionInfos = await browser.sessions.getRecentlyClosed({
        maxResults: Math.min(settings.tab_count, browser.sessions.MAX_SESSION_RESULTS)
    });
    for(let sessionInfo of sessionInfos) {
        if(sessionInfo.tab) {
           browser.sessions.restore(sessionInfo.tab.sessionId);
        } else {
            browser.sessions.restore(sessionInfo.window.sessionId);
        }
    }
    window.close();
}


async function load_session() {
    let settings = await browser.storage.local.get({
        tab_count: 10,
        max_width: 450
    });
    document.body.style.maxWidth = settings.max_width + "px";
    document.documentElement.style.maxWidth = settings.max_width + "px";
    let gettingSessions = browser.sessions.getRecentlyClosed({
        maxResults: Math.min(settings.tab_count, browser.sessions.MAX_SESSION_RESULTS)
    });
    gettingSessions.then(restoreMostRecent, onError);
    document.getElementById("restore-all").addEventListener('click', restoreAll);
}

document.addEventListener('DOMContentLoaded', load_session);
