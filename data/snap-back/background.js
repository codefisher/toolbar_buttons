browser.browserAction.onClicked.addListener(function(tab) {
    console.log(tab.id) ;
    let executing = browser.tabs.executeScript(tab.id, {
        code: "for(let i = 0; i < window.history.length; i++) {window.history.go(-i);}",
        runAt: "document_start"
    });
});