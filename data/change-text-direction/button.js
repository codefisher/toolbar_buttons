changeTextDirection: function(event) {
	var doc = event.target.ownerDocument;
	var win = doc.defaultView;
	try {
		var browser = win.gBrowser.mCurrentBrowser;
	} catch (e) {
		var browser = doc.getElementById("messagepane");
	}
	toolbar_buttons.SwitchDocumentDirection(browser.contentWindow);
}
SwitchDocumentDirection: function(aWindow) {
  /* taken from Firefox, because Thunderbird does not have it as well */
  // document.dir can also be "auto", in which case it won't change
  if (aWindow.document.dir == "ltr" || aWindow.document.dir == "") {
    aWindow.document.dir = "rtl";
  } else if (aWindow.document.dir == "rtl") {
    aWindow.document.dir = "ltr";
  }
  for (var run = 0; run < aWindow.frames.length; run++)
    toolbar_buttons.SwitchDocumentDirection(aWindow.frames[run]);
}