/* functions that are used by more then one button */

setButtonStatus: function(button, status) {
	button.setAttribute("activated", status);
	var menu_item = document.getElementById(button.id + '-menu-item');
	if(menu_item) {
		menu_item.setAttribute("activated", status);
	}
	if(button.parentNode.getAttribute("mode") == "text") {
		button.setAttribute("checked", Boolean(status));
	} else {
		button.removeAttribute("checked");
	}
}

OpenAddonsMgr: function(type, typeUrl) {
	var extensionManager = toolbar_buttons.interfaces.WindowMediator
					.getMostRecentWindow("Extension:Manager");
	if (extensionManager) {
		extensionManager.focus();
		extensionManager.showView(type);
	} else {
		var addonManager = toolbar_buttons.interfaces.WindowMediator
			.getMostRecentWindow("Addons:Manager");
		if (addonManager) {
			addonManager.focus();
			addonManager.gViewController.loadView(typeUrl);
		} else {
			var contents = toolbar_buttons.getUrlContents("chrome://mozapps/content/extensions/extensions.xul");
			var ww = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
                   .getService(Components.interfaces.nsIWindowWatcher);
			var win = ww.openWindow(window, "chrome://mozapps/content/extensions/extensions.xul",
			                        "Addons:Manager", "chrome,centerscreen", null);
			win.addEventListener("load", function() { win.gViewController.loadView(typeUrl); }, false);
		}
	}
}

getUrlContents: function(aURL){
	var ioService = toolbar_buttons.interfaces.IOService;
	var scriptableStream = toolbar_buttons.interfaces.ScriptableInputStream;
	var channel=ioService.newChannel(aURL,null,null);
	var input = channel.open();
	scriptableStream.init(input);
	var str = scriptableStream.read(input.available());
	scriptableStream.close();
	input.close();
	return str;
}

wrongVersion: function(event) {
	var XulAppInfo = toolbar_buttons.interfaces.XULAppInfo();
	var stringBundle = toolbar_buttons.interfaces.StringBundleService
			.createBundle("chrome://{{chrome_name}}/locale/button.properties");
	var title = stringBundle.GetStringFromName("wrong-version-title");
	var error = stringBundle.formatStringFromName("wrong-version",
					[event.target.label, XulAppInfo.name,
					 	XulAppInfo.version], 3);
	toolbar_buttons.interfaces.PromptService.alert(window, title, error);
}

showAMenu: function(aEvent) {
	var aMenu = null;
	for (var i = 0; i < arguments.length; i++) {
		aMenu = document.getElementById(arguments[i]);
		if (aMenu) {
			break;
		}
	}
	if (!aMenu) {
		toolbar_buttons.wrongVersion();
	}
	var popup = aMenu.firstChild.cloneNode(true);
	while(aEvent.target.firstChild) {
		aEvent.target.removeChild(aEvent.target.firstChild);
	}
	aEvent.target.appendChild(popup);
	aEvent.target.firstChild.openPopup(aEvent.target, "after_start");
}

openMessengerWindowOrTab: function(url, event) {
	if(event.button == 0) {
		toolbar_buttons.openDialog(window, url, "", "chrome,centerscreen");
	} else if(event.button == 1) {
		var tabmail = document.getElementById('tabmail');
		if(tabmail) {
			tabmail.openTab('contentTab', {contentPage: url});
		} else {
			toolbar_buttons.openDialog(window, url, "", "chrome,centerscreen");
		}
	}
}

getAppPath: function(Application) {
	try {
		var wrk = Components.classes['@mozilla.org/windows-registry-key;1']
				.createInstance(Components.interfaces.nsIWindowsRegKey);
		wrk.open(wrk.HKEY_CURRENT_USER, "SOFTWARE\\Clients\\" + Application + "\\", wrk.ACCESS_READ);
		var appName = wrk.readStringValue("");
		wrk.close();
		wrk.open(wrk.HKEY_CURRENT_USER, "SOFTWARE\\Clients\\" + Application + "\\" + appName + "\\shell\\open\\command", wrk.ACCESS_READ);
		var appPath = wrk.readStringValue("");
		wrk.close();
		if (appPath.match(/".*" .*/)) {
			appPath = appPath.match(/"(.*)" .*/)[1];
		}
		return appPath;
	} catch (e) {
		return false;
	}
}

initApp: function(Application) {
	var prefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
	if (Application == "News" && prefs.getCharPref("readnews.path") != "") {
		var appPath = prefs.getCharPref("readnews.path");
	} else if (Application == "Mail" && prefs.getCharPref("readmail.path") != "") {
		var appPath = prefs.getCharPref("readmail.path");
	} else {
		var appPath = toolbar_buttons.getAppPath(Application);
	}
	if (appPath) {
		try {
			var appFile = toolbar_buttons.interfaces.LocalFile();
			appFile.initWithPath(appPath);
			var process = toolbar_buttons.interfaces.Process();
			process.init(appFile);
			process.run(false, [], 0);
			return;
		} catch(e) {}
	}
	try {
		toMessengerWindow(); // if this is SeaMonkey, this might be a good fall back?
	} catch(e) {
		var stringBundle = toolbar_buttons.interfaces.StringBundleService
			.createBundle("chrome://{{chrome_name}}/locale/button.properties");
		var title = stringBundle.GetStringFromName("no-path-title");
		var error = stringBundle.GetStringFromName("no-path-message-version");
		toolbar_buttons.interfaces.PromptService.alert(window, title, error);
	}
}

getFile: function(name) {
	var stringBundle = toolbar_buttons.interfaces.StringBundleService
		.createBundle("chrome://{{chrome_name}}/locale/button.properties");
	var fp = toolbar_buttons.interfaces.FilePicker();
	fp.init(window, stringBundle.GetStringFromName("filepath"), Ci.nsIFilePicker.modeOpen);
	if (fp.show() == Ci.nsIFilePicker.returnOK) {
		document.getElementById(name).value = fp.file.path;
		var evt = document.createEvent("HTMLEvents");
		evt.initEvent("input", true, true);
		document.getElementById(name).dispatchEvent(evt);
	}
}

checkBrowserReload: function() {
	if (toolbar_buttons.interfaces.ExtensionPrefBranch.getBoolPref("do.reload")) {
		BrowserReload();
	}
}

PluginHelper: {
	/*
	 * Credit for much of this code belongs to Prefbar, and is used under the
	 * terms of the GPL
	 */
	GetPluginTags: function() {
		return toolbar_buttons.interfaces.PluginHost.getPluginTags({});
	},

	GetPluginEnabled: function(aRegEx) {
		var plugins = this.GetPluginTags();
		if (!plugins)
			return false;
		for ( var i = 0; i < plugins.length; i++) {
			if (plugins[i].name.match(aRegEx) && !plugins[i].disabled)
				return true;
		}
		return false;
	},

	SetPluginEnabled: function(aRegEx, aValue, aName) {
		if (!aName)
			aName = aRegEx.toString().replace(/[^a-z ]/gi, "");
		var filenames = {};
		var stringBundle = toolbar_buttons.interfaces.StringBundleService
				.createBundle("chrome://{{chrome_name}}/locale/button.properties");
		var title = stringBundle.GetStringFromName("plugin-error");
		var plugins = this.GetPluginTags();
		if (!plugins)
			return;
		var found = false;
		for ( var i = 0; i < plugins.length; i++) {
			if (plugins[i].name.match(aRegEx)) {
				plugins[i].disabled = !aValue;
				var filename = plugins[i].filename;
				// https://www.mozdev.org/bugs/show_bug.cgi?id=22582
				if (filename in filenames) {
					var message = stringBundle.formatStringFromName(
							"mutiple-plugin-installed", [ aName ], 1);
					toolbar_buttons.interfaces.PromptService.alert(lastWindow,
							title, message);
				}
				filenames[filename] = true;
				found = true;
			}
		}

		if (!found) {
			var lastWindow = toolbar_buttons.interfaces.WindowMediator
					.getMostRecentWindow(null);
			var message = stringBundle.formatStringFromName("plugin-not-found",
					[ aName ], 1);
			toolbar_buttons.interfaces.PromptService.alert(lastWindow, title,
					message);
		}
	},
}

cssFileToUserContent: function(aCssFile, remove, toggle, button_id) {
	var sss = toolbar_buttons.interfaces.StyleSheetService,
		ios = toolbar_buttons.interfaces.IOService;
	var url = ios.newURI(aCssFile, null, null),
		button = document.getElementById(button_id);
	if (sss.sheetRegistered(url, sss.USER_SHEET)) {
		if (!button || remove || toggle) {
			sss.unregisterSheet(url, sss.USER_SHEET);
			return true;
		}
	} else {
		if (button && (!remove || toggle)) {
			sss.loadAndRegisterSheet(url, sss.USER_SHEET);
			return false;
		}
	}
	return false;
}

loadUserContentSheet: function(sheet, pref, button_id) {
	var sss = toolbar_buttons.interfaces.StyleSheetService,
		ios = toolbar_buttons.interfaces.IOService,
		prefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
	var url = ios.newURI(sheet, null, null);
	try {
		if (!prefs.getBoolPref(pref)
				&& document.getElementById(button_id)
				&& !sss.sheetRegistered(url, sss.USER_SHEET)) {
			sss.loadAndRegisterSheet(url, sss.USER_SHEET);
		}
	} catch (e) {
	}
}

stopContent: function(button, pref) {
	//if(toolbar_buttons.extensionPrefToggleStatus(button, pref))
	//	BrowserReload();
	toolbar_buttons.extensionPrefToggleStatus(button, pref);
}

loadContectBlocker: function(fullPref, prefName, button_id, sheet, func) {
	window.addEventListener("load", function(e) {
		var prefWatch = new toolbar_buttons.PreferenceWatcher();
		prefWatch.startup(fullPref, button_id, func ? func : function(state) {
			var button = document.getElementById(button_id);
			if(button) {
				toolbar_buttons.cssFileToUserContent(sheet, state, false, button_id);
				toolbar_buttons.setButtonStatus(button, state);
			}
		});
		toolbar_buttons.loadUserContentSheet(sheet, prefName, button_id);
		window.addEventListener("unload", function(e) {
			prefWatch.shutdown();
		}, false);
	}, false);
}

clearBar: function(bar) {
	var item = document.getElementById(bar + "bar"), toolbar = item;
	if(item) {
		do {
			toolbar = toolbar.parentNode;
		} while(toolbar && toolbar.nodeName != "toolbar");
		if(toolbar && toolbar.collapsed)
			toolbar.collapsed = !toolbar.collapsed;
		item.value = "";
		item.focus();
	} else {
		var stringBundle = toolbar_buttons.interfaces.StringBundleService
				.createBundle("chrome://{{chrome_name}}/locale/button.properties");
		var title = stringBundle.GetStringFromName("bar-missing-title"), name = "";
		// lousy because the code for matching strings is not smart enough
		if(bar == "search") {
			name = stringBundle.GetStringFromName("bar-missing-search");
		} else {
			name = stringBundle.GetStringFromName("bar-missing-url");
		}
		var error = stringBundle.formatStringFromName("bar-missing-error", [name], 1);
		toolbar_buttons.interfaces.PromptService.alert(window, title, error);
	}
}

showOnlyThisFrame: function() {
	var focusedWindow = document.commandDispatcher.focusedWindow;
	if (isContentFrame(focusedWindow)) {
		var doc = focusedWindow.document;
		var frameURL = doc.location.href;

		urlSecurityCheck(frameURL, gBrowser.contentPrincipal,
						 Ci.nsIScriptSecurityManager.DISALLOW_SCRIPT);
		var referrer = doc.referrer;
		gBrowser.loadURI(frameURL, referrer ? makeURI(referrer) : null);
	}
}

searchBarSize: function(opp) {
	var stringBundle = toolbar_buttons.interfaces.StringBundleService
		.createBundle("chrome://{{chrome_name}}/locale/button.properties");
	var item = document.getElementById("search-container"), toolbar = item, size;
	if(item) {
		do {
			toolbar = toolbar.parentNode;
		} while(toolbar && toolbar.nodeName != "toolbar");
		if(toolbar && toolbar.collapsed)
			toolbar.collapsed = !toolbar.collapsed;
		if(isNaN(opp)) {
			var input = {value: item.width};
			var result = toolbar_buttons.interfaces.PromptService.prompt(null, stringBundle.GetStringFromName("search-bar-size-title"),
					stringBundle.GetStringFromName("search-bar-size-message"), input, null, {value: false});
			size = input.value;
			if(result && size){
				size = Math.round(Number(size));
				if(isNaN(size)) {
					toolbar_buttons.interfaces.PromptService.alert(window, stringBundle.GetStringFromName("error"),
							stringBundle.GetStringFromName("search-bar-numbers"));
					return false;
				}
			} else {
				return false;
			}
		} else {
			size = Number(item.width) + (opp * 10);
		}
		if(size > -1){
			item.width = size;
			// incase the search bar is not on the same bar as the address bar
			item.style.maxWidth = size + 'px';
		} else {
			toolbar_buttons.interfaces.PromptService.alert(window, stringBundle.GetStringFromName("error"),
					stringBundle.formatStringFromName("search-bar-size", [size], 1));
		}

	} else {
		var title = stringBundle.GetStringFromName("bar-missing-title");
		// lousy because the code for matching strings is not smart enough
		var name = stringBundle.GetStringFromName("bar-missing-search");
		var error = stringBundle.formatStringFromName("bar-missing-error", [name], 1);
		toolbar_buttons.interfaces.PromptService.alert(window, title, error);
	}
}

realNavigate: function(event, dirPrev) {
	var dir;
	if (dirPrev) {
		if (event && event.shiftKey) {
			dir = nsMsgNavigationType.previousUnreadMessage;
		} else {
			dir = nsMsgNavigationType.previousMessage;
		}
	} else {
		if (event && event.shiftKey) {
			dir = nsMsgNavigationType.nextUnreadMessage;
		} else {
			dir = nsMsgNavigationType.nextMessage;
		}
	}
	return GoNextMessage(dir, false);
}

getETDL: function() {
	var eTLDService = toolbar_buttons.interfaces.EffectiveTLDService;

	var eTLD;
	var uri = window.content.document.documentURIObject;
	try {
		eTLD = eTLDService.getBaseDomain(uri);
	} catch (e) {
		// getBaseDomain will fail if the host is an IP address or is empty
		eTLD = uri.asciiHost;
	}
	return eTLD;
}

openPermissions: function(type, title, text) {
	var bundlePreferences = toolbar_buttons.interfaces.StringBundleService
		.createBundle("chrome://browser/locale/preferences/preferences.properties");
	var params = { blockVisible   : true,
				   sessionVisible : true,
				   allowVisible   : true,
				   prefilledHost  : toolbar_buttons.getETDL(),
				   permissionType : type,
				   windowTitle	: bundlePreferences.GetStringFromName(title),
				   introText	  : bundlePreferences.GetStringFromName(text) };
	window.openDialog("chrome://browser/content/preferences/permissions.xul",
			"Browser:Permissions", "", params);
}

openDialog: function(parentWindow, url, windowName, features) {
    var array = Components.classes["@mozilla.org/array;1"]
                          .createInstance(Components.interfaces.nsIMutableArray);
    for (var i = 4; i < arguments.length; i++) {
        var variant = Components.classes["@mozilla.org/variant;1"]
                                .createInstance(Components.interfaces.nsIWritableVariant);
        variant.setFromVariant(arguments[i]);
        array.appendElement(variant, false);
    }
    var watcher = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
                            .getService(Components.interfaces.nsIWindowWatcher);
    return watcher.openWindow(parentWindow, url, windowName, features, array);
}