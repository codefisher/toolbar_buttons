const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

var EXPORTED_SYMBOLS = ["loadButtons", "unloadButtons"];

Cu.import("resource:///modules/CustomizableUI.jsm");
Cu.import("resource://services-common/stringbundle.js");
{{modules}}

var toolbar_buttons = {
	interfaces: {},
	// the important global objects used by the extension
	toolbar_button_loader: function(parent, child){
		var object_name;
		for(object_name in child){
			parent[object_name] = child[object_name];
		}
	}
};
var loader = Cc["@mozilla.org/moz/jssubscript-loader;1"].getService(Ci.mozIJSSubScriptLoader);
var gScope = this;

function loadButtons(window) {
	window.toolbar_buttons = toolbar_buttons;
	var scope = gScope;
	scope.window = window;
	scope.document = window.document;
	let buttonStrings = new StringBundle("chrome://{{chrome-name}}/locale/{{locale-file-prefix}}button_labels.properties");
	{{scripts}}
	
	{{toolbars}}
	registerToolbars(window, document, {{toolbar_ids}});
	
{{buttons}}

	{{menu}}
	
	{{keys}}
	
	{{end}}
}

function unloadButtons(window) {
	var document = window.document;
	var button_ids = {{button_ids}};
	var toolbar_ids = {{toolbar_ids}};
	for(var i in button_ids) {
		var button_id = button_ids[i];
		CustomizableUI.destroyWidget(button_id);
		var key = document.getElementById(button_id + '-key');
		if(key) {
			key.parentNode.removeChild(key);
		}
		var menuitem = document.getElementById(button_id + '-menu-item');
		if(menuitem) {
			menuitem.parentNode.removeChild(menuitem);
		}
	}
	var menu = document.getElementById('{{menu_id}}');
	if(menu && !menu.firstChild.firstChild) {
		menu.parentNode.removeChild(menu);
	}
	for(var t in toolbar_ids) {
		var toolbar = document.getElementById(toolbar_ids[t]);
		if(toolbar) {
			toolbar.parentNode.removeChild(toolbar);
			CustomizableUI.unregisterArea(toolbar_ids[t], false);
		}
	}
}

function registerToolbars(window, document, toolbar_ids) {
	for(var i in toolbar_ids) {
		CustomizableUI.registerArea(toolbar_ids[i], {
			type: CustomizableUI.TYPE_TOOLBAR,
			defaultPlacements: [],
			defaultCollapsed: false
		}, true);
		observeToolbar(toolbar_ids[i]);
	}
}

function observeToolbar(toolbar_id) {
	var prefs = Cc['@mozilla.org/preferences-service;1'].getService(Ci.nsIPrefService)
			.getBranch("{{pref-root}}" + 'toolbar_status.' + toolbar_id + '.');
	var toolbar = document.getElementById(toolbar_id);
	var mutationObserver = new window.MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			if(mutation.attributeName && mutation.attributeName != 'currentset') {
				prefs.setCharPref(mutation.attributeName, toolbar.getAttribute(mutation.attributeName));
			}
		});
	});
	var attrList = prefs.getChildList('', {});
	for(var i in attrList) {
		toolbar.setAttribute(attrList[i], prefs.getCharPref(attrList[i]));
	}
	mutationObserver.observe(toolbar, { attributes: true, subtree: false });
}