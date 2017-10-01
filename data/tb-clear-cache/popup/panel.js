const data_options_ids = [
    "tb-clear-cache-history",
    "tb-clear-cache-download",
    "tb-clear-cache-form-history",
    "tb-clear-cache-cookies",
    "tb-clear-cache-cache",
    "tb-clear-cache-logins",
    "tb-clear-cache-offline-data",
];

const data_options_keys = [
    "cache_history",
    "cache_download",
    "form_history",
    "cache_cookies",
    "cache_cache",
    "cache_logins",
    "offline_data",
];

const time_spans_ids = [
    "tb-clear-cache-last-hour",
    "tb-clear-cache-last-two-hours",
    "tb-clear-cache-last-four-hours",
    "tb-clear-cache-today",
    "tb-clear-cache-everything"
];

function save_options(event) {
    let time_span = time_spans_ids.indexOf(event.target.id);
    if (time_span === -1) {
        let option = data_options_ids.indexOf(event.target.id);
        let obj = {};
        obj[data_options_keys[option]] = event.target.checked;
        browser.storage.local.set(obj);
    } else {
        browser.storage.local.set({
            'time_span': time_span,
        });
    }
}

function onError(error) {
    console.log(`Error: ${error}`);
    window.close();
}

function goClearCache(items) {
    let time = Date.now() - (60 * 60 * 1000);
    switch (items.time_span) {
        case 0:
            time = Date.now() - (60 * 60 * 1000);
            break;
        case 1:
            time = Date.now() - (2 * 60 * 60 * 1000);
            break;
        case 2:
            time = Date.now() - (4 * 60 * 60 * 1000);
            break;
        case 3:
            let d = new Date();
            d.setHours(0, 0, 0, 0);
            time = d.getTime();
            break;
        case 4:
            time = 0;
            break;
        default:
            return;
    }
    let options = {'since': time};
    if (items.cache_history) {
        browser.browsingData.removeHistory(options);
    }
    if (items.cache_download) {
        browser.browsingData.removeDownloads(options);
    }
    if (items.form_history) {
        browser.browsingData.removeFormData(options);
    }
    if (items.cache_cookies) {
        browser.browsingData.removeCookies(options);
    }
    if (items.cache_logins) {
        browser.browsingData.removePasswords(options);
    }
    if (items.offline_data) {
        browser.browsingData.remove(options, {
            'fileSystems': true,
            'localStorage': true
        });
    }
    if (items.should_notify) {
        browser.notifications.create({
            type: 'basic',
            title: browser.i18n.getMessage('tbClearCacheLabel'),
            message: browser.i18n.getMessage('tbClearCacheMessage'),
            iconUrl: '/files/backspace.svg'
        });
    }
    window.close();
}

function doClearCache() {
    let gettingItem = browser.storage.local.get({
        cache_history: false,
        cache_download: false,
        form_history: false,
        cache_cookies: false,
        cache_cache: true,
        cache_logins: false,
        offline_data: false,
        should_confirm: true,
        should_notify: true,
        time_span: 0
    });
    gettingItem.then(goClearCache, onError);
}

function onGot(items) {
    for (let i = 0; i < data_options_keys.length; i++) {
        document.getElementById(data_options_ids[i]).checked = items[data_options_keys[i]];
    }
    document.getElementById(time_spans_ids[items.time_span]).checked = true;
}

async function clearCache() {
    let items = await browser.storage.local.get({
        should_confirm: true
    });
    if (!items.should_confirm) {
        doClearCache();
    } else {
        document.getElementById('tb-go-clear-cache').style.display = "block";
    }
}

function restore_options() {
    let inputs = document.querySelectorAll('input');
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].addEventListener('change', save_options);
    }
    let gettingItem = browser.storage.local.get({
        cache_history: false,
        cache_download: false,
        form_history: false,
        cache_cookies: false,
        cache_cache: true,
        cache_logins: false,
        offline_data: false,
        time_span: 0
    });
    gettingItem.then(onGot, onError);
    document.getElementById('tb-clear-cache').addEventListener('click', clearCache);
    document.getElementById('tb-clear-yes').addEventListener('click', doClearCache);
    document.getElementById('tb-clear-no').addEventListener('click', function () {
        window.close();
    });

}

document.addEventListener('DOMContentLoaded', restore_options);
