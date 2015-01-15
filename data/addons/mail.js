openExtensionTab: function(event) {
	if(event.button == 1) { 
		document.getElementById('tabmail').openTab('contentTab', 
				{contentPage: 
					'chrome://mozapps/content/extensions/extensions.xul'});
		return true;
	}
	return false;
}