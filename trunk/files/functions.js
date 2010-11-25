/* functions that are used by more then one button */

toggleToolbar: function(aEvent, toolbar_id) {
	if(toolbar_id != aEvent.originalTarget.parentNode.id) {
		var toolbar = document.getElementById(toolbar_id);
		toolbar.collapsed = !toolbar.collapsed;
		document.persist(toolbar_id, "collapsed");
	}
}

toggleToolbarButtonUpdate: function(aEvent, button_id, toolbar_id) {
	// normal toolbars use collapsed, the statusbar uses hidden
	if((aEvent.attrName == "collapsed" || aEvent.attrName == "hidden")) {
		var button = document.getElementById(button_id);
		if(button && aEvent.originalTarget.id == toolbar_id) {
			var toolbar = aEvent.originalTarget;
			button.setAttribute("activated", toolbar.collapsed || toolbar.hidden);
		}
	}
}

setToggleToolbar: function(toolbar_id, button_id) {
	var button = document.getElementById(button_id);
	if(button) {
		var toolbar = document.getElementById(toolbar_id);
		button.setAttribute("activated", toolbar.collapsed || toolbar.hidden);
		button.removeAttribute("checked");
	}
}

loadToggleToolbar: function(button_id, toolbar_id){
	window.addEventListener(
			"load",
			function(aEvent) {
				toolbar_buttons.setToggleToolbar(toolbar_id, button_id);
				document.getElementById(toolbar_id).addEventListener(
						"DOMAttrModified",
						function(aEvent) {
							toolbar_buttons.toggleToolbarButtonUpdate(aEvent,
									button_id, toolbar_id);
						},
				false);
			},
	true);
}

OpenAddonsMgr: function(type) {
	var extensionManager = toolbar_button_interfaces.WindowMediator
					.getMostRecentWindow("Extension:Manager");
	if (extensionManager) {
		extensionManager.focus();
		extensionManager.showView(type);
	} else {
		window.openDialog(
				"chrome://mozapps/content/extensions/extensions.xul",
				"",
				"chrome,menubar,extra-chrome,toolbar,dialog=no,resizable",
				type);
	}
}

LoadURL: function(url, event) {
	if (event.button == 1) {
		var newPage = getBrowser().addTab(url);
		getBrowser().selectedTab = newPage;
	} else if (event.button == 0) {
		loadURI(url);
	}
}

wrongVersion: function(event) {
	var XulAppInfo = toolbar_button_interfaces.XULAppInfo()
	var stringBundle = toolbar_button_interfaces.StringBundleService
			.createBundle("chrome://{{chrome_name}}/locale/button.properties");
	var title = stringBundle.GetStringFromName("wrong-version-title");
	var error = stringBundle.formatStringFromName("wrong-version",
					[event.target.label, XulAppInfo.name,
					 	XulAppInfo.version], 3);
	toolbar_button_interfaces.PromptService.alert(window, title, error);
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
	if(aEvent.target.firstChild) {
		aEvent.target.removeChild(aEvent.target.firstChild);
	}
	aEvent.target.appendChild(popup);
	aEvent.target.firstChild.openPopup(aEvent.target, "after_start");
}

openMessengerWindowOrTab: function(url, event) {
	if(event.button == 0) {
		window.openDialog(url);
	} else if(event.button == 1) {
		var tabmail = document.getElementById('tabmail');
		if(tabmail) {
			tabmail.openTab('contentTab', {contentPage: url});
		} else {
			window.openDialog(url);
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
	var prefs = toolbar_button_interfaces.ExtensionPrefBranch;
	if (Application == "News" && prefs.getCharPref("readnews.path") != "") {
		var appPath = prefs.getCharPref("readnews.path");
	} else if (Application == "Mail" && prefs.getCharPref("readmail.path") != "") {
		var appPath = prefs.getCharPref("readmail.path");
	} else {
		var appPath = toolbar_buttons.getAppPath(Application);
	}
	if (appPath) {
		try {
			var appFile = toolbar_button_interfaces.LocalFile();
			appFile.initWithPath(appPath);
			var process = toolbar_button_interfaces.Process();
			process.init(appFile);
			process.run(false, [], 0);
			return;
		} catch(e) {}
	}
	var stringBundle = toolbar_button_interfaces.StringBundleService
		.createBundle("chrome://{{chrome_name}}/locale/button.properties");
	var title = stringBundle.GetStringFromName("no-path-title");
	var error = stringBundle.GetStringFromName("no-path-message-version");
	toolbar_button_interfaces.PromptService.alert(window, title, error);

}

getFile: function(name) {
	var stringBundle = toolbar_button_interfaces.StringBundleService
		.createBundle("chrome://{{chrome_name}}/locale/button.properties");
	var fp = toolbar_button_interfaces.FilePicker();
	fp.init(window, stringBundle.GetStringFromName("filepath"), Ci.nsIFilePicker.modeOpen);
	if (fp.show() == Ci.nsIFilePicker.returnOK) {
		document.getElementById(name).value = fp.file.path;
		var evt = document.createEvent("HTMLEvents");
		evt.initEvent("input", true, true);
		document.getElementById(name).dispatchEvent(evt);
	}
}