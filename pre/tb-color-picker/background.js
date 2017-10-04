let copyBox;

async function colorPicker() {
    let settings = await browser.storage.local.get({
        open_in: "window",
    });
    let fullURL = browser.runtime.getURL("files/colorpicker.html");
    if (settings.open_in === "tab") {
        let tabs = await browser.tabs.query({"url": fullURL});
        if (tabs.length > 0) {
            browser.tabs.update(tabs[0].id, {"active": true});
        } else {
            browser.tabs.create({
                url: fullURL,
                active: true,
            });
        }
    } else {
        let query = {
            type: "panel",
            width: 750,
            height: 500,
        };
        let tabs = await browser.tabs.query({"url": fullURL});
        if (tabs.length > 0) {
            query.tabId = tabs[0].id;
        } else {
            query.url = fullURL;
        }
        browser.windows.create(query);
    }
}

function onError(error) {
    console.error(`Error: ${error}`);
}

async function dropper() {
    tabs = await browser.tabs.query({
        currentWindow: true,
        active: true
    });
    if (tabs.length > 0) {
        browser.tabs.sendMessage(
            tabs[0].id,
            {action: "dropper"}
        ).then(response => {
            // the message back from content script
        }).catch(onError);
    }
}

async function saveColor(hexColor) {
    let hex = hexColor.replace("#", "");
    let settings = await browser.storage.local.get({
        savedColors: [],
    });
    let colors = settings.savedColors;
    colors.push({
        "hex": hex,
        "time": new Date().getTime()
    });
    return await browser.storage.local.set({
        savedColors: colors,
    });
}

async function notifyCopy(color) {
    let settings = await browser.storage.local.get({
        should_notify: true,
    });
    if (settings.should_notify) {
        browser.notifications.create({
            type: 'basic',
            title: browser.i18n.getMessage('tbColorPickerLabel'),
            message: browser.i18n.getMessage('tbColorPickerCopied', color),
            iconUrl: '/files/color-wheel.svg'
        });
    }
}

var port;

function connected(p) {
    port = p;
    port.onMessage.addListener(m => {
        if (m.hex) {
            saveColor(m.hex);
            if (m.copied) {
                notifyCopy(m.color);
            }
        } else if (m.action == "colorpicker") {
            colorPicker();
        } else if (m.action == "dropper") {
            dropper();
        }
    });
}

browser.runtime.onConnect.addListener(connected);

document.addEventListener('DOMContentLoaded', function (event) {
    copyBox = document.createElement("textarea");
    document.body.appendChild(copyBox);
});

