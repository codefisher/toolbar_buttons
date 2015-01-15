openOptionsTab: function(event) {
	if(event.button == 1) { 
		document.getElementById('tabmail').openTab('contentTab', 
				{contentPage: 
					'chrome://messenger/content/preferences/preferences.xul'});
		return true;
	}
	return false;
}