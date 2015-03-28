var SAVED_LENGTH = 17;

Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://gre/modules/FileUtils.jsm");

var dbFile = FileUtils.getFile("ProfD", ["toolbar_buttons.sqlite"]);
var dbConn = Services.storage.openDatabase(dbFile);

function StartUp() {
	if(window.arguments[0]) {
		currentColor = getRGB(window.arguments[0]);
	}
	setupInputs();
	setupPalette();
	setupNamedColors();
	setupHexInput();
	setUpSavedFromDatabase();
	setWheelAndPanelEvents();
	doApply(updateColor, currentColor);
}

function openEyedropper() {
	var devtools = Components.utils.import("resource://gre/modules/devtools/Loader.jsm", {}).devtools;
	var Eyedropper =  devtools.require("devtools/eyedropper/eyedropper").Eyedropper;
	Eyedropper.prototype.copyColor = function(callback) {
		clearTimeout(this._copyTimeout);	
		var color = this._colorValue.value;
		saveValueToDatabse(color);
		doApply(updateColor, getRGB(color));		
		this._copyTimeout = setTimeout(() => {
			this._colorValue.value = color;	
			if (callback) {
				callback();
			}
		}, 0);
		window.focus();
	};
	var eyedropper = new Eyedropper(window.opener);
	eyedropper.open();
	window.opener.focus();
}

function onAccept() {
	var hex = doApply(getHex, currentColor);
	saveValueToDatabse(hex);
	dbConn.asyncClose();
}

function onCancelColor() {
	dbConn.asyncClose();
}

gTds = [];

function setUpSavedFromDatabase() {
	var tmp = document.createElementNS('http://www.w3.org/1999/xhtml', 'tr');
	for(i = 0; i < SAVED_LENGTH; i++) {
		var cell = document.createElementNS('http://www.w3.org/1999/xhtml', 'td');
		cell.addEventListener('click', function(event) {
			if(this.value) doApply(updateColor, getRGB(this.value)); 
		}, false);
		tmp.appendChild(cell);
		gTds.push(cell);
	}
	document.getElementById("sc").appendChild(tmp);

	document.getElementById("v").addEventListener('click', function(event) {
		var hex = doApply(getHex, currentColor);
		saveValueToDatabse(hex);
		loadDatabaseSaved();
	});
	loadDatabaseSaved();
}

function loadDatabaseSaved() {
	try {
		var stmt = dbConn.createStatement("SELECT name FROM picked_color ORDER BY time DESC LIMIT 0, 17");
		var count = 0;
		while (stmt.executeStep()) {
			var name = "#" + stmt.row.name;
			gTds[count].style.backgroundColor = name;
			gTds[count].value = name;
			count++;
		}
	} catch(e) {}
}

function saveValueToDatabse(hexColor) {
	var hex = hexColor.replace("#", "");
	var stmt = dbConn.createAsyncStatement("INSERT INTO picked_color (name, time) VALUES(:name, :time)");
	stmt.params.time = Math.floor(Date.now() / 1000);
	stmt.params.name = hex;
	
	stmt.executeAsync({
		handleResult: function(aResultSet) { },	
		handleError: function(aError) { },			
		handleCompletion: function(aReason) {
			loadDatabaseSaved();
		}
	});
}
