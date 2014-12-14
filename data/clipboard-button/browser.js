clipboardLink: {
	getText: function() {
		var clip = toolbar_buttons.interfaces.Clipboard;
		var trans = toolbar_buttons.interfaces.Transferable();
		trans.addDataFlavor("text/unicode");
		clip.getData(trans, clip.kGlobalClipboard);
		var str = {}, strLength = {};
		trans.getTransferData("text/unicode", str, strLength);
		if (str) {
			var str = str.value.QueryInterface(Ci.nsISupportsString);
		}
		if (str) {
			var pastetext = str.data.substring(0, strLength.value / 2);
		}
		return pastetext;
	},
	open: function(event) {
		if (event.button == 1) {
			this.OpenNewTab();
		}
	},
	openCommand: function () {
		var prefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
		var mode = prefs.getIntPref("clipboard.open.mode");
		if(mode == 2) {
			this.OpenWindow();
		} else if(mode == 1) {
			this.OpenNewTab();
		} else {
			this.OpenLink();
		}
	},
	OpenNewTab: function() {
		try {
			var newPage = getBrowser().addTab(this.getText());
			getBrowser().selectedTab = newPage;
		} catch (e) {} // no clipboard data
	},
	OpenLink: function() {
		try {
			loadURI(this.getText());
		} catch (e) {} // no clipboard data

	},
	OpenWindow: function() {
		try {
			openNewWindowWith(this.getText(), window.content.document,
					null, false);
		} catch (e) {} // no clipboard data
	}
}