function startupWeb() {
	setupInputs();
	setupPalette();
	setupNamedColors();
	setupHexInput();
	setUpSavedWeb();
	setWheelAndPanelEvents();
	doApply(updateColor, currentColor);
}

function setUpSavedWeb() {

}

document.addEventListener('DOMContentLoaded', function(event) {
	if(document.location.hash == '') {
		document.location = document.location.href + "#color";
	}
	startupWeb();
});

