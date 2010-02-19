
var load_toolbar_button = {
	start: function() {
	    var test_ids = ["status-bar", ];
	    for (var i = 0; i < test_ids.length; i++) {
	        if (!document.getElementById(test_ids[i])) {
	            setTimeout(load_toolbar_button_start, 100);
	            return;
	        }
	    }
	    var ext_id = "{{uuid}}";
	    var toolbar_buttons = toolbar_button_interfaces.ExtensionManager.getItemForID(ext_id);
	    var version = toolbar_buttons.version;
	    var prefs = toolbar_button_interfaces.PrefBranch;
	    var app_name = toolbar_button_interfaces.XULAppInfo().name;
	    var url = "{{version_url}}" + version + "?application=" + app_name.toLowerCase();
	
	    var extensionFlagFile = toolbar_button_interfaces.Properties.get("ProfD", Components.interfaces.nsIFile);
	    extensionFlagFile.append("extensions");
	    extensionFlagFile.append(ext_id);
	    extensionFlagFile.append("installed");
	
	    if(!extensionFlagFile.exists() && prefs.getCharPref("extension.tbutton.current.version") != version){
	        prefs.setCharPref("extension.tbutton.current.version", version);
	        load_toolbar_button.file_put_contents(extensionFlagFile,version);
	        load_toolbar_button.load_url(url);
	    }
	},	
	file_put_contents: function(file,data){
		var foStream = toolbar_button_interfaces.FileOutputStream();
		foStream.init(file, 0x02 | 0x08 | 0x20, 0664, 0);
		foStream.write(data, data.length);
		foStream.close();
	},	
	load_url: function(url) {
	    try {
	        var newPage = getBrowser().addTab(url);
	        getBrowser().selectedTab = newPage;
	    } catch (e) {
	    	//var tabmail = document.getElementById('tabmail');
	    	//if(tabmail) {
	    	//	var tab = tabmail.openTab('contentTab', {contentPage: url});
	    	//} else {
	    		var uri = toolbar_button_interfaces.IOService.newURI(url, null, null);
	    		toolbar_button_interfaces.ExternalProtocolService.loadUrl(uri);
	    	//}
	    }
	}
}

window.addEventListener("load", function() { 
		setTimeout(load_toolbar_button.start, 100);
	}, false);
