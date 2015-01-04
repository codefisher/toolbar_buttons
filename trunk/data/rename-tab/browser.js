renameTab: function() {
	if(toolbar_buttons.renameTabObj)
		return;
	var thisTab = window.getBrowser().selectedTab;
	thisTab.labelNode = document.getAnonymousElementByAttribute(thisTab, "class", "tab-text");
	if(thisTab.labelNode == null) {
		thisTab.labelNode = document.getAnonymousElementByAttribute(thisTab, "class", "tab-text tab-label");
	}
	var thisTitle = thisTab.label;
	thisTab.labelNode.style.display = "none";
	var textBox = document.createElement("textbox");
	thisTab.textBox = thisTab.labelNode.parentNode.appendChild(textBox);
	thisTab.textBox.focus();
	thisTab.textBox.value = thisTitle;
	thisTab.textBox.addEventListener("blur", toolbar_buttons.doRenameTab, true);
	thisTab.textBox.addEventListener("keypress", toolbar_buttons.renameTabInput, true);
	toolbar_buttons.renameTabObj = thisTab;
}

doRenameTab: function() {
	var thisTab = toolbar_buttons.renameTabObj;
	thisTab.labelNode.style.display = "block";
	var label = thisTab.textBox.value;
	thisTab.textBox.parentNode.removeChild(thisTab.textBox);
	thisTab.label = label;
	toolbar_buttons.renameTabObj = null;
}

renameTabInput: function(event) {
	var thisTab = toolbar_buttons.renameTabObj;
	if (event.keyCode == event.DOM_VK_RETURN)
		thisTab.focus();
}