#include wrongVersion

openDomInspector: function(event, aDocument) {
	try {
		inspectDOMDocument(aDocument);
	} catch(e) {
		toolbar_buttons.wrongVersion(event);
	}
}