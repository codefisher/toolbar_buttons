toogleAddonsBar: function(event) {
	var doc = event.target.ownerDocument;
	if(doc.getElementById("tb-addon-bar")) {
		toolbar_buttons.toggleToolbar(event, 'tb-addon-bar');
	} else {
		toolbar_buttons.loadAddonsBar(doc, true);
	}
}

loadAddonsBar: function(doc, show) {
	var win = doc.defaultView;
	if(!doc.getElementById("tb-addon-bar") && (doc.getElementById('statusbar-toggle') || doc.getElementById('statusbar-toggle-menu-item'))) {
		var stringBundle = toolbar_buttons.interfaces.StringBundleService
			.createBundle("chrome://{{chrome_name}}/locale/{{locale_file_prefix}}button.properties");
		var prefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
		
		var addonbar = doc.createElement('toolbar');
		addonbar.id = "tb-addon-bar";
		addonbar.setAttribute("class", "toolbar-primary chromeclass-toolbar");
		addonbar.setAttribute("toolbarname", stringBundle.GetStringFromName("statusbar-toggle-toolbar-name"));
		addonbar.setAttribute("hidden", "true");
		addonbar.setAttribute("context", "toolbar-context-menu");
		addonbar.setAttribute("toolboxid", "navigator-toolbox");
		addonbar.setAttribute("mode", "icons");
		addonbar.setAttribute("iconsize", "small");
		addonbar.setAttribute("customizable", "true");
		if(show) {
			addonbar.setAttribute("collapsed", false);
			prefs.setBoolPref('statusbar-toggle.collapsed', false);
		} else {
			addonbar.setAttribute("collapsed", prefs.getBoolPref('statusbar-toggle.collapsed'));
		}
				
		doc.getElementById('browser-bottombox').appendChild(addonbar);
		addonbar._delegatingToolbar = "tb-addon-bar";
		CustomizableUI.registerArea("tb-addon-bar", {
			legacy: false,
			type: CustomizableUI.TYPE_TOOLBAR,
			defaultPlacements: [],
			defaultCollapsed: false
		}, true);
		addonbar.setAttribute("hidden", "false");
		var tb = toolbar_buttons;
		var observer = function(mutations) {
			if(prefs.getBoolPref('statusbar-toggle.collapsed') != addonbar.collapsed) {
				prefs.setBoolPref('statusbar-toggle.collapsed', addonbar.collapsed);
				tb.setButtonStatus(doc.getElementById('statusbar-toggle'), addonbar.collapsed || addonbar.hidden);
			}
		};
		var mutationObserver = new win.MutationObserver(observer);
		mutationObserver.observe(addonbar, { attributes: true, subtree: false });
		prefs.addObserver("statusbar-toggle.collapsed", {
			observe: function(subject, topic, data) {
				if (topic != "nsPref:changed") {
					return;
				}
				var value = prefs.getBoolPref('statusbar-toggle.collapsed');
				if(value != addonbar.collapsed) {
					addonbar.collapsed = value;
				}
			}
		}, false);
	}
	toolbar_buttons.loadToggleToolbar(doc, "statusbar-toggle", "tb-addon-bar");
}

toolbar_buttons.loadAddonsBar(document, false);
