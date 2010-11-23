renameAllTabsBlank: function() {
    var tabs = gBrowser.mTabContainer.childNodes;
    for (var i = 0; i < tabs.length; i++) {
        var tab = tabs[i];
        tab.label = "";
        tab.removeAttribute("image");
    }
}