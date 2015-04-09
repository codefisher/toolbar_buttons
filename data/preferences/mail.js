openOptionsTab: function(event) {
	var doc = event.target.ownerDocument.defaultView;
	if(event.button == 1) { 
		doc.getElementById('tabmail').openTab('contentTab',
				{contentPage: 
					'chrome://messenger/content/preferences/preferences.xul'});
		return true;
	}
	return false;
}