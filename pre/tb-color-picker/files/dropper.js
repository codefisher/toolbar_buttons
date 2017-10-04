var bodyListener;
var canvas;
var context;
var hexChars = "0123456789ABCDEF";
var table;

var canvasSize = 25;
var tableSize = 11;

var colorBox;
var hexBox;
var rgbBox;
var box;

var selectSize = 1;
var hexDisplay = "upper";

var isOnDiv = false;

// this talks to runtime
let port = browser.runtime.connect({name: "port-from-cs"});

function getHex(r, g, b) {
    function toHex(d) {
        return ("0" + ((d < 16) ? "" : toHex((d - d % 16) / 16)) + hexChars.charAt(d % 16)).slice(-2);
    }

    return "#" + toHex(r) + toHex(g) + toHex(b);
}

function updatePicker(event) {
    if(isOnDiv) {
        return;
    }
    var x = event.clientX + document.documentElement.scrollLeft;
    var y = event.clientY + document.documentElement.scrollTop;
    context.drawWindow(window, x - Math.floor(canvasSize / 2), y - Math.floor(canvasSize / 2),
        canvasSize, canvasSize, "rgba(0,0,0,0)");
    for (let i = 0; i < tableSize; i++) {
        for (let j = 0; j < tableSize; j++) {
            let img_data = context.getImageData(i + ((canvasSize - tableSize) / 2), j + ((canvasSize - tableSize) / 2), 1, 1).data;
            let td = table.childNodes[j].childNodes[i];
            td.style.background = getHex(img_data[0], img_data[1], img_data[2]);
        }
    }

    let R = 0;
    let G = 0;
    let B = 0;
    for (let i = 0; i < selectSize; i++) {
        for (let j = 0; j < selectSize; j++) {
            let img_data = context.getImageData(i + ((canvasSize - selectSize) / 2), j + ((canvasSize - selectSize) / 2), 1, 1).data;
            R += img_data[0];
            G += img_data[1];
            B += img_data[2];
        }
    }
    let r = Math.floor(R / (selectSize * selectSize));
    let g = Math.floor(G / (selectSize * selectSize));
    let b = Math.floor(B / (selectSize * selectSize))
    let hex = getHex(r, g, b);
    colorBox.style.background = hex;
    if (hexDisplay === "lower") {
        hexBox.value = hex.toLowerCase();
    } else {
        hexBox.value = hex.toUpperCase();
    }

    rgbBox.textContent = `rgb(${r}, ${g}, ${b})`
}

function activateDropper() {
    box = document.createElement('div');
    box.id = 'tb-color-picker-dropper-box-wrapper';
    document.body.appendChild(box);


    box.addEventListener("mouseenter", function () {
        isOnDiv = true;
    });
    box.addEventListener("mouseleave", function () {
        isOnDiv = false;
    });

    let info = document.createElement('div');
    info.id = 'tb-color-picker-dropper-box-info';
    box.appendChild(info);

    colorBox = document.createElement('div');
    colorBox.id = 'tb-color-picker-dropper-box-color';
    info.appendChild(colorBox);

    hexBox = document.createElement('input');
    hexBox.setAttribute('readonly', true);
    hexBox.id = 'tb-color-picker-dropper-box-hex';
    info.appendChild(hexBox);

    rgbBox = document.createElement('div');
    rgbBox.id = 'tb-color-picker-dropper-box-rgb';
    info.appendChild(rgbBox);

    let options = [
        [1, "Point Select"],
        [3, "3x3 Average"],
        [5, "5x5 Average"],
        [9, "9x9 Average"],
        [13, "13x13 Average"],
        [25, "25x25 Average"]
    ];

    let select = document.createElement('select');
    for (let option of options) {
        let opt = document.createElement('option');
        opt.setAttribute('value', option[0]);
        let text = document.createTextNode(option[1]);
        opt.appendChild(text);
        select.appendChild(opt);
    }
    info.appendChild(select);
    select.addEventListener('change', function (event) {
        selectSize = parseInt(select.value);
    });

    canvas = document.createElement('canvas');
    canvas.setAttribute("width", canvasSize);
    canvas.setAttribute("height", canvasSize);
    box.appendChild(canvas);
    context = canvas.getContext('2d');

    let closeImg = document.createElement('img');
    closeImg.setAttribute('src', browser.runtime.getURL("files/close.png"));
    closeImg.id = "tb-color-picker-dropper-box-close";
    closeImg.addEventListener("click", close);
    box.appendChild(closeImg);

    table = document.createElement('table');
    for (let i = 0; i < tableSize; i++) {
        let tr = document.createElement('tr');
        for (let j = 0; j < tableSize; j++) {
            let td = document.createElement('td');
            if (i == Math.floor(tableSize / 2) && j == Math.floor(tableSize / 2)) {
                td.classList.add('tb-color-picker-center');
            }
            if (i == Math.floor(tableSize / 2) && j == (Math.floor(tableSize / 2) - 1)) {
                td.classList.add('tb-color-picker-left');
            }
            if (i == (Math.floor(tableSize / 2) - 1) && j == Math.floor(tableSize / 2)) {
                td.classList.add('tb-color-picker-above');
            }
            td.style.background = "#ffffff";
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    box.appendChild(table);

    document.addEventListener('mousemove', updatePicker);
    document.addEventListener('click', pageClicker);
}

function pageClicker(event) {
    if(isOnDiv) {
        return;
    }
    hexBox.select();
    try {
        var successful = document.execCommand('copy');
    } catch (err) {
        var successful = false;
    }
    port.postMessage({"hex": hexBox.value, "copied": successful});
    document.body.removeChild(box);
    document.removeEventListener("mousemove", updatePicker);
    document.removeEventListener("click", pageClicker);
    event.preventDefault();
    event.stopPropagation();
    return false;
}

function close(event) {
    document.body.removeChild(box);
    document.removeEventListener("mousemove", updatePicker);
    document.removeEventListener("click", pageClicker);
    event.preventDefault();
    event.stopPropagation();
    return false;
}

function onError(error) {
    console.log(`Error: ${error}`);
}

function gotHexDisplay(item) {
    hexDisplay = item.hex_display;
}

// this is messages from tabs.sendMessage
browser.runtime.onMessage.addListener(request => {
    if (request.action === "dropper") {
        activateDropper();
    }
    let getting = browser.storage.local.get({
        hex_display: "upper",
    });
    getting.then(gotHexDisplay, onError);
    return Promise.resolve({response: "done"});
});