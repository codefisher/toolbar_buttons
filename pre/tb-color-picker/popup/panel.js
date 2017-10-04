var port = browser.runtime.connect({name:"port-from-panel"});


document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('open-colorpicker').addEventListener('click', function() {
        port.postMessage({'action': 'colorpicker'});
        window.close();
    });
    document.getElementById('open-dropper').addEventListener('click', function() {
        port.postMessage({'action': 'dropper'});
        window.close();
    });
    document.getElementById('open-options').addEventListener('click', function() {
        browser.runtime.openOptionsPage();
        window.close();
    });
});
