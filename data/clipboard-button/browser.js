clipboardLink: {
	getText: function() {
		var clip = toolbar_buttons.interfaces.Clipboard;
		var trans = toolbar_buttons.interfaces.Transferable();
		trans.addDataFlavor("text/unicode");
		clip.getData(trans, clip.kGlobalClipboard);
		var str = {}, strLength = {};
		trans.getTransferData("text/unicode", str, strLength);
		if (str) {
			var pastetext = str.value.QueryInterface(Ci.nsISupportsString);
			if (pastetext) {
				return pastetext.data.substring(0, strLength.value / 2);
			}
		}
		return '';
	},
	open: function(event) {
		if (event.button == 1) {
			this.OpenNewTab(event);
		}
	},
	openCommand: function (event) {
		var prefs = toolbar_buttons.interfaces.ExtensionPrefBranch;
		var mode = prefs.getIntPref("clipboard.open.mode");
		if(mode == 2) {
			this.OpenWindow(event);
		} else if(mode == 1) {
			this.OpenNewTab(event);
		} else {
			this.OpenLink(event);
		}
	},
	OpenNewTab: function(event) {
		var win = event.target.ownerDocument.defaultView;
		try {
			var browser = win.getBrowser();
			browser.selectedTab = browser.addTab(this.getText());
		} catch (e) {} // no clipboard data
	},
	OpenLink: function(event) {
		var win = event.target.ownerDocument.defaultView;
		try {
			win.loadURI(this.getText());
		} catch (e) {} // no clipboard data

	},
	OpenWindow: function(event) {
		var win = event.target.ownerDocument.defaultView;
		try {
			win.openNewWindowWith(this.getText(), win.content.document, null, false);
		} catch (e) {} // no clipboard data
	}
}