goClearBrowserCache: function() {
	var stringBundle = toolbar_buttons.interfaces.StringBundleService
		.createBundle("chrome://{{chrome_name}}/locale/button.properties");
	var question = stringBundle.GetStringFromName("tb-clear-cache.question");
	var title = stringBundle.GetStringFromName("tb-clear-cache.label");
	var prompt = toolbar_buttons.interfaces.ExtensionPrefBranch.getBoolPref("clear.cache.check");
	if(!prompt || toolbar_buttons.interfaces.PromptService.confirm(null, title, question)) {
		// copied from chrome://browser/content/sanitize.js
	    var cache = Cc["@mozilla.org/netwerk/cache-storage-service;1"].
	                getService(Ci.nsICacheStorageService);
	    try {
	      // Cache doesn't consult timespan, nor does it have the
	      // facility for timespan-based eviction.  Wipe it.
	      cache.clear();
	    } catch(er) {}
	
	    var imageCache = Cc["@mozilla.org/image/tools;1"].
	                     getService(Ci.imgITools).getImgCacheForDocument(null);
	    try {
	      imageCache.clearCache(false); // true=chrome, false=content
	    } catch(er) {}
    }
}