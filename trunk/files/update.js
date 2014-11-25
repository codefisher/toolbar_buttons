if(!this.load_toolbar_button) {
	var load_toolbar_button = {
		start: function() {
			var test_ids = ["status-bar"], i;
			for (i = 0; i < test_ids.length; i++) {
				if (!document.getElementById(test_ids[i])) {
					setTimeout(load_toolbar_button.start, 100);
					return;
				}
			}
			var version = "{{version}}";
			var prefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
			var url = "{{version_url}}{{version}}";

			var extensionFlagFile = toolbar_buttons.interfaces.Properties.get("ProfD", Ci.nsIFile);
			extensionFlagFile.append("tb-{{chrome_name}}-installed");

			if(!extensionFlagFile.exists()) {
				var extensionVersion = null;
			} else {
				var extensionVersion = load_toolbar_button.file_get_contents(extensionFlagFile);
			}
				
			if(extensionVersion != version && prefs.getCharPref("current.version") != version){
				prefs.setCharPref("current.version", version);
				load_toolbar_button.file_put_contents(extensionFlagFile, version);
				load_toolbar_button.load_url(url);
			}
			window.removeEventListener("load", load_toolbar_button.init, false);
			
		},
		file_put_contents: function(file,data){
			var foStream = toolbar_buttons.interfaces.FileOutputStream();
			foStream.init(file, 0x02 | 0x08 | 0x20, 0664, 0);
			foStream.write(data, data.length);
			foStream.close();
		},
		file_get_contents: function(file){
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
				var newPage = getBrowser().addTab(url);
				getBrowser().selectedTab = newPage;
			} catch (e) {
				var uri = toolbar_buttons.interfaces.IOService.newURI(url, null, null);
				toolbar_buttons.interfaces.ExternalProtocolService.loadUrl(uri);
			}
		},
		init: function() {
			setTimeout(load_toolbar_button.start, 3000);
		}
	}
	window.addEventListener("DOMContentLoaded", load_toolbar_button.init, false);
}