const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

Cu.import("resource://gre/modules/Services.jsm");
var styleSheets = [Services.io.newURI("chrome://{{chrome-name}}/skin/button.css", null, null)];

function getModules(uri) {
	var modules = [];	
	{{loaders}}
	return modules;
}

function loadIntoWindow(window) {
	// kind of dumb using the document uri, but it makes coping from the chrome.manifest easier
	let uri = window.document.documentURI;
	let modules = getModules(uri);
	if(modules) {
		for (var i = 0, len = styleSheets.length; i < len; i++) {
			window.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowUtils).loadSheet(styleSheets[i], 1);
		}
		try {
			for(var i = 0; i < modules.length; i++) {
				var mod = Cu.import(modules[i]);
				mod.loadButtons(window);
			}
		} catch(e) {
			window.console.log(e);
		}
	}
	if(uri == 'chrome://global/content/customizeToolbar.xul') {
		for (var j = 0, len = styleSheets.length; j < len; j++) {
			window.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowUtils).loadSheet(styleSheets[j], 1);
		}
	}
}

function unloadFromWindow(window) {
	let uri = window.document.documentURI;
	let modules = getModules(uri);
	if(modules) {
		for (let i = 0, len = styleSheets.length; i < len; i++) {
			window.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowUtils).removeSheet(styleSheets[i], 1);
		}
		try {
			for(var i = 0; i < modules.length; i++) {
				var mod = Cu.import(modules[i]);
				mod.unloadButtons(window);
				Cu.unload(modules[i]); // makes next call to import get a new object
			}
		} catch(e) {
			window.console.log(e);
		}
	}
	if(uri == 'chrome://global/content/customizeToolbar.xul') {
		for (var i = 0, len = styleSheets.length; i < len; i++) {
			window.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowUtils).removeSheet(styleSheets[i], 1);
		}
	}
}

var windowListener = {
	onOpenWindow: function(aWindow) {
		// Wait for the window to finish loading
		let domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
		domWindow.addEventListener("load", function onLoad() {
			domWindow.removeEventListener("load", onLoad, false);
			loadIntoWindow(domWindow);
		}, false);
	}, 
	onCloseWindow: function(aWindow) {},
	onWindowTitleChange: function(aWindow, aTitle) {}
};

function createResource(resourceName, uriPath) {
	let resource = Services.io.getProtocolHandler("resource").QueryInterface(Ci.nsIResProtocolHandler);
	var fileuri = Services.io.newURI(uriPath, null, null);
	resource.setSubstitution(resourceName, fileuri);
}

function startup(data, reason) {
	// set our default prefs
	Services.scriptloader.loadSubScript("chrome://{{chrome-name}}/content/defaultprefs.js", {pref: setDefaultPref});
	
	{{resource}}

	let wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);

	// Load into any existing windows
	let windows = wm.getEnumerator(null);
	while (windows.hasMoreElements()) {
		let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
		loadIntoWindow(domWindow);
	}

	// Load into any new windows
	wm.addListener(windowListener);
}

function shutdown(data, reason) {
	if (reason == APP_SHUTDOWN) {
		return;
	}

	let resource = Services.io.getProtocolHandler("resource").QueryInterface(Ci.nsIResProtocolHandler);
	resource.setSubstitution("{{chrome-name}}", null);

	let wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
 
	// Stop listening for new windows
	wm.removeListener(windowListener);

	// Unload from any existing windows
	let windows = wm.getEnumerator(null);
	while (windows.hasMoreElements()) {
		let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
		unloadFromWindow(domWindow);
	}
}

function install(data, reason) {
{{install}}
}

function uninstall(data, reason) {
}

function getGenericPref(branch, prefName) {
	switch (branch.getPrefType(prefName)) {
		default:
		case 0:   return undefined;					  // PREF_INVALID
		case 32:  return getUCharPref(prefName,branch);  // PREF_STRING
		case 64:  return branch.getIntPref(prefName);	// PREF_INT
		case 128: return branch.getBoolPref(prefName);   // PREF_BOOL
	}
}

function setGenericPref(branch, prefName, prefValue) {
	switch (typeof prefValue) {
		case "string":
			setUCharPref(prefName, prefValue, branch);
			return;
		case "number":
			branch.setIntPref(prefName, prefValue);
			return;
		case "boolean":
			branch.setBoolPref(prefName, prefValue);
			return;
	}
}

function setDefaultPref(prefName, prefValue) {
	var defaultBranch = Services.prefs.getDefaultBranch(null);
	setGenericPref(defaultBranch ,prefName, prefValue);
}

function getUCharPref(prefName, branch) {
	branch = branch ? branch : Services.prefs;
	return branch.getComplexValue(prefName, Ci.nsISupportsString).data;
}

function setUCharPref(prefName, text, branch) {
	var string = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
	string.data = text;
	branch = branch ? branch : Services.prefs;
	branch.setComplexValue(prefName, Ci.nsISupportsString, string);
}
