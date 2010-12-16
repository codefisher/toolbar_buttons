#include PluginHelper

JavaToggle: {
	/*
	 * Credit for much of this code belongs to Prefbar, and is used
	 * under the terms of the GPL
	 */

	//Java(TM) Plug-in                  <-- Linux
	//IcedTea NPR Web Browser Plugin    <-- Linux (http://icedtea.classpath.org/)
	//Java Embedding Plugin 0.9.7.2     <-- Mac OS X
	//InnoTek OS/2 Kit for Java Plug-in <-- OS/2
	//Java(TM) Platform SE 6 U16        <-- Windows
	//Java Deployment Toolkit 6.0.160.1 <-- Don't match for this!
	prefbarRegExJava: /(^| )(java|icedtea).*(platform|plug-?in)/i,

	toggle: function() {
		var state = this.status(),
			button = document.getElementById("java-toggle"),
			prefs = toolbar_button_interfaces.PrefBranch;
		prefs.setBoolPref("security.enable_java", !state);
		toolbar_buttons.PluginHelper.SetPluginEnabled(this.prefbarRegExJava, !state, "Java");
		button.setAttribute("activated", !state);
		toolbar_buttons.checkBrowserReload();
	},

	status: function() {
		var prefs = toolbar_button_interfaces.PrefBranch, state = true;
		try {
			state = prefs.getBoolPref("security.enable_java");
		} catch(e) {}
		return state && toolbar_buttons.PluginHelper.GetPluginEnabled(this.prefbarRegExJava);
	}
}

window.addEventListener("load", function(e) {
	var prefWatch = new toolbar_buttons.PreferenceWatcher();
	prefWatch.startup("security.enable_java", "java-toggle");
	window.addEventListener("unload", function(e) {
		prefWatch.shutdown();
	}, false);
}, false);