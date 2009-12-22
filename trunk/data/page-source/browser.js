ViewPageSourceNow: function(event) {
    if (event.button == 1) {
        var focusedWindow = content;
        var docCharset = "charset=" + focusedWindow.document.characterSet;
        var reference = focusedWindow.getSelection();
        if (!reference.isCollapsed) {
            window.openDialog("chrome://global/content/viewPartialSource.xul", 
            				  "_blank", "scrollbars,resizable,chrome,dialog=no",
            				  null, docCharset, reference, "selection");
        } else {
            var sourceURL = "view-source:" + content.document.location.href;
            gBrowser.selectedTab = gBrowser.addTab(sourceURL);
        }
    } else if (event.button == 2) {
        var url = content.document.location.href;
        openWebPanel(url, "view-source:" + url);
    } else if (event.button != 0) {
        BrowserViewSourceOfDocument(content.document);
    }
}