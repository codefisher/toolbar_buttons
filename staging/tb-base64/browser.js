base64: function() {
	/*
		citing sources:
			http://custombuttons2.com/forum/buttons/buttons-database/datauri-generator2.html
			resource://greasemonkey/GM_notification.js
	*/
	const nsIFilePicker = Ci.nsIFilePicker;
	var fp = Cc['@mozilla.org/filepicker;1'].
		createInstance(nsIFilePicker);
	fp.init(window, gNavigatorBundle.getString("openFile"),
		nsIFilePicker.modeOpen);
	fp.appendFilters(nsIFilePicker.filterAll |
		nsIFilePicker.filterText |
		nsIFilePicker.filterImages |
		nsIFilePicker.filterXML |
		nsIFilePicker.filterHTML);
	fp.appendFilter("JavaScript", "*.js");
	fp.appendFilter("CSS", "*.css");
	fp.appendFilter("XUL", "*.xul");
	if (fp.show() == nsIFilePicker.returnCancel) return;
	var localFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
	localFile.initWithPath(fp.file.path);
	if (!localFile) return;
	var contentType = Cc["@mozilla.org/mime;1"].getService(Ci.nsIMIMEService).getTypeFromFile(localFile);
	var inputStream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
	inputStream.init(localFile, 0x01, 0600, 0);
	var stream = Cc["@mozilla.org/binaryinputstream;1"].createInstance(Ci.nsIBinaryInputStream);
	stream.setInputStream(inputStream);
	var encoded = btoa(stream.readBytes(stream.available()));
	Components.classes["@mozilla.org/widget/clipboardhelper;1"]
		.getService(Components.interfaces.nsIClipboardHelper).copyString("data:" + contentType + ";base64," + encoded);
	try {
		Components.classes["@mozilla.org/alerts-service;1"]
			.getService(Components.interfaces.nsIAlertsService).showAlertNotification(
				"chrome://toolbar-button/skin/24/building-go.png",//The 48 one may be better I could use this button to base 64 it
				"Data URI Button Says", "Copied data URI to clipboard successfully", false, "", null);
	}
	catch(e){
		alert("Data URI Button Says\nCopied data URI to clipboard successfully\nBTW installing Growl will make this notice less annoying on a MAC");
	}
}
