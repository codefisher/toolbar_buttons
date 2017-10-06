var port = browser.runtime.connect({name:"port-from-panel"});


document.addEventListener('DOMContentLoaded', async function () {
    document.getElementById('open-colorpicker').addEventListener('click', function() {
        port.postMessage({'action': 'colorpicker'});
        window.close();
    });
    document.getElementById('open-dropper').addEventListener('click', function() {
        port.postMessage({'action': 'dropper'});
        window.close();
    });
    document.getElementById('open-options').addEventListener('click', function() {
        browser.runtime.openOptionsPage();
        window.close();
    });
    document.getElementById('open-copy').addEventListener('click', function() {
        document.location = "/popup/copy.html";
    });

    let settings = await browser.storage.local.get({
        savedColors: [],
    });
    let colors = settings.savedColors;
    let hex = "FF0000";
    if(colors.length) {
        hex = colors[colors.length - 1].hex;
    }
    let hexValue = "#" + hex.replace("#", "");
    document.getElementById('current-color-box').style.backgroundColor = hexValue;
});
