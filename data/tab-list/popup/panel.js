async function load_session() {
    try {
        let query = {
            currentWindow: true
        };
        let tabs = await browser.tabs.query(query);
        let tabsMenu = document.getElementById('tabs');
        for (let tab of tabs) {
            let div = document.createElement('div');
            div.classList.add('button');
            let img = document.createElement('img');
            img.setAttribute('src', tab.favIconUrl);
            img.setAttribute('width', '16');
            img.setAttribute('height', '16');
            div.append(img);
            let text = document.createTextNode(tab.title);
            div.appendChild(text);
            div.addEventListener('click', function() {
                browser.tabs.update(tab.id, {
                    active: true,
                });
            });
            tabsMenu.appendChild(div);
        }
    } catch (error) {
        console.log(`Error: ${error}`);
    }
}

document.addEventListener('DOMContentLoaded', load_session);
