function restoreMostRecent(sessionInfos) {
	if (!sessionInfos.length) {
		console.log("No sessions found")
		return;
	}
	let tabs = document.getElementById('tabs');
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
            var text = document.createTextNode(sessionInfo.tab.title);
        } else {
            var text = document.createTextNode(sessionInfo.tab.title);
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


function load_session() {
    var gettingSessions = browser.sessions.getRecentlyClosed({
        maxResults: 10
    });
    gettingSessions.then(restoreMostRecent, onError);
}

document.addEventListener('DOMContentLoaded', load_session);
