goClearBrowserCache: function() {
    const Ci = Components.interfaces;
    var cacheService = toolbar_buttons.interfaces.CacheService;
    try {
      cacheService.evictEntries(Ci.nsICache.STORE_ANYWHERE);
    } catch(er) {}
}