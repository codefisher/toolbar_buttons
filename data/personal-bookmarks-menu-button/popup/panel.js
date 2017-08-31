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
            if (bookmarkItem.url.startsWith('http')) {
                if (settings.new_tab) {
                    browser.tabs.create({url: bookmarkItem.url});
                } else {
                    browser.tabs.update({url: bookmarkItem.url});
                }
            } else if (bookmarkItem.url.startsWith('javascript:')) {
                let code = decodeURI(bookmarkItem.url.replace(/^javascript:/, ''));
                if(!code.endsWith(';')) {
                    code += ';';
                }
                browser.tabs.executeScript({
                        "code": "let url = " + code + " if(url) { window.document.location=url; }"
                });
            } else {
                if (settings.new_tab) {
                    browser.tabs.executeScript({
                        "code": "window.open('" + bookmarkItem.url.replace(/'/g, "\\';") + "');"
                    });
                } else {
                    browser.tabs.executeScript({
                        "code": "window.document.location='" + bookmarkItem.url.replace(/'/g, "\\'") + "';"
                    });
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
    for (let child of bookmarkItems[0].children) {
        displayItem(child, box);
    }
}

function onRejected(error) {
    console.log(`An error: ${error}`);
}

function loadBookmarks() {
    let gettingTree = browser.bookmarks.getSubTree("toolbar_____");
    gettingTree.then(displayTree, onRejected);
}

document.addEventListener('DOMContentLoaded', loadBookmarks);
