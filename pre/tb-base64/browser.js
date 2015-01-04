base64: function() {
	/*
		citing sources:
			http://custombuttons2.com/forum/buttons/buttons-database/datauri-generator2.html
			resource://greasemonkey/GM_notification.js
	*/
	var nsIFilePicker = Ci.nsIFilePicker;
	var fp = Cc['@mozilla.org/filepicker;1'].
		createInstance(nsIFilePicker);
	fp.init(window, window.gNavigatorBundle.getString("openFile"),
		nsIFilePicker.modeOpen);
	fp.appendFilters(nsIFilePicker.filterAll |
		nsIFilePicker.filterText |
		nsIFilePicker.filterImages |
		nsIFilePicker.filterXML |
		nsIFilePicker.filterHTML);
	fp.appendFilter("JavaScript", "*.js");
	fp.appendFilter("CSS", "*.css");
	fp.appendFilter("XUL", "*.xul");
	if (fp.show() === nsIFilePicker.returnCancel) {
		return;
	}
	var localFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
	localFile.initWithPath(fp.file.path);
	if (!localFile) return;
	var stringBundle = toolbar_buttons.interfaces.StringBundleService
		.createBundle("chrome://{{chrome_name}}/locale/{{locale_file_prefix}}button.properties");
	var title = stringBundle.GetStringFromName("tb-base64-alert");
	var contentType;
	
	try {
		contentType = Cc["@mozilla.org/mime;1"].getService(Ci.nsIMIMEService).getTypeFromFile(localFile);
	} catch(e){
		toolbar_buttons.interfaces.PromptService.alert(window, title, stringBundle.GetStringFromName("tb-base64-alert-content-type"));
		return;
	}
	var inputStream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
	inputStream.init(localFile, 0x01, 0600, 0);
	var stream = Cc["@mozilla.org/binaryinputstream;1"].createInstance(Ci.nsIBinaryInputStream);
	stream.setInputStream(inputStream);
	var encoded = window.btoa(stream.readBytes(stream.available()));
	Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper).copyString("data:" + contentType + ";base64," + encoded);
	toolbar_buttons.interfaces.PromptService.alert(window, title, stringBundle.GetStringFromName("tb-base64-alert-copied"));
}