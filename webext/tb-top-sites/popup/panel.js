function logTopSites(topSitesArray) {
    let box = document.getElementById('sites');
    for (topSite of topSitesArray) {
        let div = document.createElement('div');
        div.classList.add('button');
        let text = document.createTextNode(topSite.title);
        div.appendChild(text);
        div.addEventListener('click', async function () {
            let settings = await browser.storage.local.get({
                new_tab: false,
            });
            if (settings.new_tab) {
                browser.tabs.create({url: topSite.url});
            } else {
                browser.tabs.update({url: topSite.url});
            }
            window.close();
        });
        box.appendChild(div);
    }
}

function onError(error) {
    console.log(error);
}


document.addEventListener('DOMContentLoaded', function () {
    var gettingTopSites = browser.topSites.get();
    gettingTopSites.then(logTopSites, onError);
});
