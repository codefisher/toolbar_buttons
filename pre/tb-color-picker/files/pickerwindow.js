
function StartUp() {
    setupInputs();
    setupPalette();
    setupNamedColors();
    setupHexInput();
    setUpSavedFromDatabase();
    setWheelAndPanelEvents();
    doApply(updateColor, currentColor);
}

function onAccept() {
	
}

function onCancelColor() {
	
}

function setUpSavedFromDatabase() {
    /*tmp = document.createElement('tr');
    for(i = 0; i < 17; i++) {
        var cell = document.createElement('td');
        cell.addEventListener('click', function(event) {
            if(this.value) doApply(updateColor, getRGB(this.value)); 
        }, false);
        tmp.appendChild(cell);
    }
    document.getElementById("sc").appendChild(tmp);

    document.getElementById("v").addEventListener('click', function(event) {
        var hex = doApply(getHex, currentColor);
        delete sessionStorage[hex];
        sessionStorage[hex] = sessionStorage.length ? getSessionVals()[0][0]+1 : 0;
        loadSaved();
    });
    loadSaved();*/
}

function saveValueToDatabse(hexColor) {
	
}
