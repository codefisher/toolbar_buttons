getSelectedTextBox: function(event) {
	var doc = event.target.ownerDocument;
	var box = doc.commandDispatcher.focusedElement;
	if(box.nodeName.toLowerCase() != 'input' &&  box.nodeName.toLowerCase() != 'textarea'
		&& box.nodeName.toLowerCase() != 'textbox' 
		&& box.readOnly == null && box.readOnly == true) {
		return null;
	} 
	return box;
}

getSelectedTextboxText: function(event) {
	var box = toolbar_buttons.getSelectedTextBox(event);
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

putSelectedTextBoxText: function(event, text) {
	var box = toolbar_buttons.getSelectedTextBox(event);
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

textChangeCaseLower: function(event) {
	var text = toolbar_buttons.getSelectedTextboxText(event);
	if(text == null) {
		return;
	}
	toolbar_buttons.putSelectedTextBoxText(event, text.toLowerCase());
}

textChangeCaseUpper: function(event) {
	var text = toolbar_buttons.getSelectedTextboxText(event);
	if(text == null) {
		return;
	}
	toolbar_buttons.putSelectedTextBoxText(event, text.toUpperCase());
}

textChangeCaseTitle: function(event) {
	var text = toolbar_buttons.getSelectedTextboxText(event);
	if(text == null) {
		return;
	}
	toolbar_buttons.putSelectedTextBoxText(event, text.replace(/\b[\w-\']+/g, function(s) {
		return s.charAt(0).toUpperCase() + s.substr(1).toLowerCase();
	}));
}

textChangeCaseInvert: function(event) {
	var text = toolbar_buttons.getSelectedTextboxText(event);
	if(text == null) {
		return;
	}
	toolbar_buttons.putSelectedTextBoxText(event, text.split("").map(function(s) {
			return s == s.toUpperCase() ? s.toLowerCase() : s.toUpperCase();
	}).join(""));
}