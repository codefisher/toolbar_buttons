getSelectedTextBox: function() {
	var box = document.commandDispatcher.focusedElement;
	if(box.nodeName.toLowerCase() != 'input' &&  box.nodeName.toLowerCase() != 'textarea'
		&& box.nodeName.toLowerCase() != 'textbox' 
		&& box.readOnly == null && box.readOnly == true) {
		return null;
	} 
	return box;
}

getSelectedTextboxText: function() {
	var box = toolbar_buttons.getSelectedTextBox();
	if(box == null) {
		return null;
	}
	var startPos = box.selectionStart;
	var endPos = box.selectionEnd;
	if(endPos != startPos){
		return box.value.substring(startPos, endPos);
	}
	return null;
}

putSelectedTextBoxText: function(text) {
	var box = toolbar_buttons.getSelectedTextBox();
	if(box == null) {
		return null;
	}
	var startPos = box.selectionStart;
	var endPos = box.selectionEnd;
	var startText = box.value.substring(0, startPos);
	var endText = box.value.substring(endPos);
	var scrollTop = box.scrollTop;
	box.value = startText + text + endText;
	box.scrollTop = scrollTop;
	box.selectionStart = startPos;
	box.selectionEnd = endPos;
}

textChangeCaseLower: function() {
	var text = toolbar_buttons.getSelectedTextboxText();
	if(text == null) {
		return;
	}
	toolbar_buttons.putSelectedTextBoxText(text.toLowerCase());
}

textChangeCaseUpper: function() {
	var text = toolbar_buttons.getSelectedTextboxText();
	if(text == null) {
		return;
	}
	toolbar_buttons.putSelectedTextBoxText(text.toUpperCase());
}

textChangeCaseTitle: function() {
	var text = toolbar_buttons.getSelectedTextboxText();
	if(text == null) {
		return;
	}
	toolbar_buttons.putSelectedTextBoxText(text.replace(/\b[\w-\']+/g, function(s) { 
		return s.charAt(0).toUpperCase() + s.substr(1).toLowerCase();
	}));
}

textChangeCaseInvert: function() {
	var text = toolbar_buttons.getSelectedTextboxText();
	if(text == null) {
		return;
	}
	toolbar_buttons.putSelectedTextBoxText(text.split("").map(function(s) {
			return s == s.toUpperCase() ? s.toLowerCase() : s.toUpperCase();
	}).join(""));
}