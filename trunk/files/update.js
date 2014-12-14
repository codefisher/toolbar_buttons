if(!this.load_toolbar_button) {
	var load_toolbar_button = {
		start: function() {
			var version = "{{version}}";
			var prefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
			var currentVersion = prefs.getCharPref("current.version");
			
			var url = "{{homepage_url}}updated/{{version}}/";
			if(currentVersion == "") {
				url = "{{homepage_url}}installed/{{version}}/";
			}

			var extensionFlagFile = toolbar_buttons.interfaces.Properties.get("ProfD", Ci.nsIFile);
			extensionFlagFile.append("tb-{{chrome_name}}-installed");
			var extensionVersion = null;
			if(extensionFlagFile.exists()) {
				var extensionVersion = load_toolbar_button.file_get_contents(extensionFlagFile);
			}
				
			if(extensionVersion != version && currentVersion != version){
				prefs.setCharPref("current.version", version);
				load_toolbar_button.file_put_contents(extensionFlagFile, version);
				load_toolbar_button.load_url(url);
			}
			window.removeEventListener("load", load_toolbar_button.start, false);
			
		},
		file_put_contents: function(file,data) {
			var foStream = toolbar_buttons.interfaces.FileOutputStream();
			foStream.init(file, 0x02 | 0x08 | 0x20, 0664, 0);
			foStream.write(data, data.length);
			foStream.close();
		},
		file_get_contents: function(file) {
			var data = '';
			var fstream = Components.classes['@mozilla.org/network/file-input-stream;1']
			  .createInstance(Components.interfaces.nsIFileInputStream);
			var sstream = Components.classes['@mozilla.org/scriptableinputstream;1']
			  .createInstance(Components.interfaces.nsIScriptableInputStream);
			fstream.init(file, -1, 0, 0);
			sstream.init(fstream); 		
			var str = sstream.read(4096);
			while (str.length > 0) {
				data += str;
				str = sstream.read(4096);
			}		
			sstream.close();
			fstream.close();
			return data;
		},
		load_url: function(url) {
			try {
				getBrowser().addTab(url);
			} catch (e) {
				var uri = toolbar_buttons.interfaces.IOService.newURI(url, null, null);
				toolbar_buttons.interfaces.ExternalProtocolService.loadUrl(uri);
			}
		},
		observe: function(aSubject, aTopic, aData) {
			setTimeout(function() { load_toolbar_button.start(); }, 100);
		},
		restore: function() {
			setTimeout(function() { load_toolbar_button.start(); }, 100);
			document.removeEventListener("SSTabRestoring", load_toolbar_button.restore, false);
		}
	};
	try {
		var prefs = toolbar_buttons.interfaces.PrefBranch;
		if(prefs.getIntPref('browser.startup.page') == 3 || prefs.getBoolPref('browser.sessionstore.resume_session_once')) {
			//this observer never seems to run for some reason??
			//var observerService = Components.classes["@mozilla.org/observer-service;1"]
		    //              .getService(Components.interfaces.nsIObserverService);
		    //observerService.addObserver(load_toolbar_button, 'sessionstore-state-finalized', false);
		    document.addEventListener("SSTabRestoring", load_toolbar_button.restore, false);
		} else {
			window.addEventListener("load", load_toolbar_button.start, false);
		}
	} catch(e) {
		window.addEventListener("load", load_toolbar_button.start, false);
	}
}
