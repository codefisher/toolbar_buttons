if(!this.load_toolbar_button) {
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
			var version = "{{version}}";
			var prefs = toolbar_button_interfaces.ExtensionPrefBranch;
			var app_name = toolbar_button_interfaces.XULAppInfo().name;
			var url = "{{version_url}}" + version + "?application=" + app_name.toLowerCase();

			var extensionFlagFile = toolbar_button_interfaces.Properties.get("ProfD", Ci.nsIFile);
			extensionFlagFile.append("extensions");
			extensionFlagFile.append(ext_id);
			extensionFlagFile.append("installed");

			if(!extensionFlagFile.exists() && prefs.getCharPref("current.version") != version){
				prefs.setCharPref("current.version", version);
				load_toolbar_button.file_put_contents(extensionFlagFile,version);
				load_toolbar_button.load_url(url);
			}
			window.removeEventListener("load", load_toolbar_button.init, false);
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
				var uri = toolbar_button_interfaces.IOService.newURI(url, null, null);
				toolbar_button_interfaces.ExternalProtocolService.loadUrl(uri);
			}
		},
		init: function() {
			setTimeout(load_toolbar_button.start, 100);
		}
	}
	window.addEventListener("load", load_toolbar_button.init, false);
}