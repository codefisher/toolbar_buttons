var port = browser.runtime.connect({name:"port-from-copy"});


document.addEventListener('DOMContentLoaded', async function () {
    let settings = await browser.storage.local.get({
        savedColors: [],
    });
    let colors = settings.savedColors;
    let hex = "FF0000";
    if(colors.length) {
        hex = colors[colors.length - 1].hex;
    }
    let hexValue = "#" + hex.replace("#", "");
    document.getElementById('colorsample-box').style.backgroundColor = hexValue;
    let copyFormats = ["hex-upper-1", "hex-lower-1", "hex-upper-2", "hex-lower-2",
        "rgb-1", "rgb-2", "rgba-1", "rgba-2", "hsl", "hsla"];
    for(let copyFormat of copyFormats) {
        let value = getInFormat(hexValue, copyFormat);
        let box = document.getElementById(copyFormat);
        box.value = value;
        box.addEventListener('click', function(event) {
            box.select();
            try {
                var successful = document.execCommand('copy');
            } catch (err) {
                var successful = false;
            }
            port.postMessage({"copied": successful, "color": value});
            window.close();
        });

    }
});