
tinyUrl: {
	XMLhttp: null,
	gURL: null,
	branch: toolbar_buttons.interfaces.PrefService.getBranch("{{pref_root}}xrl.in."),
	shouldCopy: false,

	getLink: function() {
		var self = toolbar_buttons.tinyUrl;
		self.doGetLink(self.setLink);
	},
	getMailLink: function() {
		var self = toolbar_buttons.tinyUrl;
		self.doGetLink(self.setLinkOpen);
	},
	doGetLink: function(handeler) {
		var self = toolbar_buttons.tinyUrl;
		self.gURL = null;
		var url = "http://xrl.in/?r=key&xrl=" + encodeURIComponent(window.content.document.location);
		var XMLhttp = new XMLHttpRequest;
		self.XMLhttp = XMLhttp;
		XMLhttp.onload = handeler;
		XMLhttp.open("GET", url);
		XMLhttp.send(null);
	},
	setLink: function() {
		var self = toolbar_buttons.tinyUrl;
		if(!self.XMLhttp.responseText)
			return
		var domain = self.branch.getCharPref("domain");
		self.gURL = "http://" + domain + "/" + self.XMLhttp.responseText;
		document.getElementById("urlbar").value = self.gURL;
		if(self.shouldCopy) {
			self.copyToClipBoard(self.gURL);
			self.shouldCopy = false;
		}
	},
	setLinkOpen: function() {
		var self = toolbar_buttons.tinyUrl;
		if(!self.XMLhttp.responseText)
			return
		var domain = self.branch.getCharPref("domain");
		var link = "http://" + domain + "/" + self.XMLhttp.responseText;
		window.MailIntegration.sendMessage(link, "");
	},
	changeOption: function(item) {
		var self = toolbar_buttons.tinyUrl;
		self.branch.setCharPref("domain", item.getAttribute("value"));
	},
	setOptions: function() {
		var self = toolbar_buttons.tinyUrl;
		var preview = self.branch.getCharPref("domain") == "preview.xrl.in";
		document.getElementById("tiny-url-normal").checked = !preview;
		document.getElementById("tiny-url-preview").checked = preview;
	},
	copy: function() {
		var self = toolbar_buttons.tinyUrl;
		if(self.gURL) {
			self.copyToClipBoard(self.gURL);
		} else {
			self.shouldCopy = true;
		}
	},
	mail: function() {
		var self = toolbar_buttons.tinyUrl;
		window.MailIntegration.sendMessage(self.gURL, "");
	},
	visit: function() {
		window.loadURI("http://xrl.in/");
	},
	copyToClipBoard: function(copytext) {
		var str = toolbar_buttons.interfaces.SupportsString();
		if (!str)
			return;
		str.data = copytext;
		var trans = toolbar_buttons.interfaces.Transferable();
		if (!trans)
			return;
		trans.addDataFlavor("text/unicode");
		trans.setTransferData("text/unicode", str, copytext.length * 2);
		var clip = toolbar_buttons.interfaces.Clipboard;
		if (!clip)
			return;
		clip.setData(trans, null, clip.kGlobalClipboard);
	}
}