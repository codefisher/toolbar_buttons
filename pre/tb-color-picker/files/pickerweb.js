const SAVED_LENGTH = 17;

function startupWeb() {
    setupInputs();
    setupPalette();
    setupNamedColors();
    setupHexInput();
    setUpSavedWeb();
    setWheelAndPanelEvents();
    document.getElementById('nc').addEventListener('change', selectChange);
    doApply(updateColor, currentColor);
}

let gTds = [];

function setUpSavedWeb() {
    let tmp = document.createElement('tr');
    for (let i = 0; i < SAVED_LENGTH; i++) {
        let cell = document.createElement('td');
        cell.addEventListener('click', function (event) {
            if (this.value) doApply(updateColor, getRGB(this.value));
        }, false);
        tmp.appendChild(cell);
        gTds.push(cell);
    }
    document.getElementById("sc").appendChild(tmp);

    document.getElementById("vs").addEventListener('click', function (event) {
        let hex = doApply(getHex, currentColor);
        saveValueToDatabase(hex);
        window.setTimeout(loadDatabaseSaved, 10);
    });
    loadDatabaseSaved();
}

async function loadDatabaseSaved() {
    let settings = await browser.storage.local.get({
        savedColors: [],
    });
    let colors = settings.savedColors;
    for (let i = colors.length - 1, j = 0; i >= 0 && i >= (colors.length - SAVED_LENGTH); --i, j++) {
        gTds[j].style.backgroundColor = "#" + colors[i].hex;
        gTds[j].value = "#" + colors[i].hex;
    }
}

async function saveValueToDatabase(hexColor) {
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

function storageChange(changes, area) {
    let changedItems = Object.keys(changes);
    for (var item of changedItems) {
        if(item == "hex_display") {
            hexDisplay = changes[item].newValue;
        }
    }
}

browser.storage.onChanged.addListener(storageChange);

function onError(error) {
  console.log(`Error: ${error}`);
}

function gotHexDisplay(item) {
    hexDisplay = item.hex_display;
}

document.addEventListener('DOMContentLoaded', function (event) {
    if (document.location.hash == '') {
        document.location = document.location.href + "#color";
    } else if (document.location.hash.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)) {
        currentColor = getRGB(document.location.hash);
    }
    let getting = browser.storage.local.get({
		hex_display: "upper",
	});
    getting.then(gotHexDisplay, onError);
    startupWeb();
});

