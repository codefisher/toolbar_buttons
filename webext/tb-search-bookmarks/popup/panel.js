async function displayItem(bookmarkItem, box) {
    if (bookmarkItem.url && bookmarkItem.url.startsWith('place:')) {
        return;
    }
    let div = document.createElement('div');
    div.classList.add('button');
    let text = document.createTextNode(bookmarkItem.title);
    div.appendChild(text);
    if (bookmarkItem.url) {
        div.addEventListener('click', async function () {
            let settings = await browser.storage.local.get({
                new_tab: false,
            });
            let buttonUrl = bookmarkItem.url;
            if (buttonUrl.startsWith('javascript:')) {
                let code = decodeURI(buttonUrl.replace(/^javascript:/, ''));
                if(!code.endsWith(';')) {
                    code += ';';
                }
                browser.tabs.executeScript({
                        "code": "let url = " + code + " if(url) { window.document.location=url; }"
                });
            } else if(buttonUrl.startsWith('data:')) {
                if (settings.new_tab) {
                    browser.tabs.executeScript({
                        "code": "window.open('" + buttonUrl.replace(/'/g, "\\';") + "');"
                    });
                } else {
                    browser.tabs.executeScript({
                        "code": "window.document.location='" + buttonUrl.replace(/'/g, "\\'") + "';"
                    });
                }
            } else {
                if (settings.new_tab) {
                    browser.tabs.create({url: buttonUrl});
                } else {
                    browser.tabs.update({url: buttonUrl});
                }
            }
            window.close();
        });
    }
    box.appendChild(div);
    if (bookmarkItem.children) {
        for (let child of bookmarkItem.children) {
            let div = document.createElement('div');
            div.classList.add('group');
            displayItem(child, div);
            box.appendChild(div);
        }
    }
}

function displayTree(bookmarkItems) {
    let box = document.getElementById('bookmarks');
    for (let child of bookmarkItems) {
        displayItem(child, box);
    }
}

function onRejected(error) {
    console.log(`An error: ${error}`);
}

document.getElementById('bookmark-search').addEventListener("input", function(event) {
    let box = document.getElementById('bookmarks');
    while (box.hasChildNodes()) {
        box.removeChild(box.lastChild);
    }
    if(event.target.value) {
        let searching = browser.bookmarks.search(event.target.value);
        searching.then(displayTree, onRejected);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('bookmark-search').focus();
});
