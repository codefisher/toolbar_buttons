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
	var box = aEvent.target.boxObject;
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