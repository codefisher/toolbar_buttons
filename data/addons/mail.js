openExtensionTab: function(event) {
	var doc = event.target.ownerDocument;
	if(event.button == 1) { 
		doc.getElementById('tabmail').openTab('contentTab',
				{contentPage: 
					'chrome://mozapps/content/extensions/extensions.xul'});
		return true;
	}
	return false;
}