installAddons: function() {
	var stringBundle = toolbar_buttons.interfaces.StringBundleService
			.createBundle("chrome://{{chrome_name}}/locale/button.properties");
	var title = stringBundle.GetStringFromName("installaddons");
	var fp = toolbar_buttons.interfaces.FilePicker();
	fp.init(window, title, fp.modeOpenMultiple);
	fp.appendFilter(stringBundle
			.GetStringFromName("installaddons-addons"), "*.xpi; *.jar");
	fp.appendFilter(stringBundle
			.GetStringFromName("installaddons-extensions"), "*.xpi");
	fp.appendFilter(stringBundle
			.GetStringFromName("installaddons-themes"), "*.jar");
	fp.appendFilters(fp.filterAll);

	// taken from /mozilla/toolkit/mozapps/extensions/content/extensions.js
        if (fp.show() != fp.returnOK)
          return;

	Components.utils.import("resource://gre/modules/AddonManager.jsm");
	
        var files = fp.files;
        var installs = [];

		function getBrowserElement() {
		  return window.QueryInterface(Ci.nsIInterfaceRequestor)
		               .getInterface(Ci.nsIDocShell)
		               .chromeEventHandler;
		}

        function buildNextInstall() {
          if (!files.hasMoreElements()) {
            if (installs.length > 0) {
              // Display the normal install confirmation for the installs
              AddonManager.installAddonsFromWebpage("application/x-xpinstall",
                                                    getBrowserElement(), null, installs);
            }
            return;
          }

          var file = files.getNext();
          AddonManager.getInstallForFile(file, function cmd_installFromFile_getInstallForFile(aInstall) {
            installs.push(aInstall);
            buildNextInstall();
          });
        }

        buildNextInstall();
}

viewAddonsExceptions: function(event) {
	if(event.button == 1) {
		toolbar_buttons.openPermissions("install",
				"addons_permissions_title", "addonspermissionstext");
	}
}

openAddonsExceptions: function() {
		toolbar_buttons.openPermissions("install",
				"addons_permissions_title", "addonspermissionstext");
}