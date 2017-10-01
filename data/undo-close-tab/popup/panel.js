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
	for(let i = 0; i < sessionInfos.length; i++) {
        let sessionInfo = sessionInfos[i];
        let div = document.createElement('div');
        div.classList.add('button');
        if (sessionInfo.tab) {
            let img = document.createElement('img');
            img.setAttribute('src', sessionInfo.tab.favIconUrl);
            img.setAttribute('width', '16');
            img.setAttribute('height', '16');
            div.append(img);
            text = document.createTextNode(sessionInfo.tab.title);
        } else {
            continue;
            /*let windowTabs = sessionInfo.window.tabs;
            for(let i = 0; i < windowTabs.length; i++) {
                if (windowTabs[i].active) {
                    text = document.createTextNode(windowTabs[i].title);
                }
            }*/
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
        maxResults: settings.tab_count
    });
    for(let i = 0; i < sessionInfos.length; i++) {
        if(sessionInfos[i].tab) {
           browser.sessions.restore(sessionInfos[i].tab.sessionId);
       }
    }
    window.close();
}


async function load_session() {
    let settings = await browser.storage.local.get({
        tab_count: 10
    });
    let gettingSessions = browser.sessions.getRecentlyClosed({
        maxResults: settings.tab_count
    });
    gettingSessions.then(restoreMostRecent, onError);
    document.getElementById("restore-all").addEventListener('click', restoreAll);
}

document.addEventListener('DOMContentLoaded', load_session);
