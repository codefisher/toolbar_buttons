openEyedropper: function(event) {
	var win = event.target.ownerDocument.defaultView;
	var devtools = Components.utils.import("resource://gre/modules/devtools/Loader.jsm", {}).devtools;
	var Eyedropper = devtools.require("chrome://{{chrome_name}}/content/files/eyedropper").Eyedropper;
	var eyedropper = new Eyedropper(win, { context: "other", copyOnSelect: true });
	eyedropper.open();
}