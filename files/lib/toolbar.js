toggleToolbar: function(aEvent, toolbar_id) {
	var doc = aEvent.target.ownerDocument;
	var win = doc.defaultView;
	if(!aEvent || !aEvent.originalTarget || toolbar_id != aEvent.originalTarget.parentNode.id) {
		var toolbar = doc.getElementById(toolbar_id);
		if(toolbar.collapsed || toolbar.hidden) {
			if (toolbar.hasAttribute('hidden')) {
				toolbar.setAttribute('hidden', 'false');
				toolbar.setAttribute('collapsed', 'false');
			} else {
				toolbar.setAttribute('collapsed', 'false');
			}
		} else {
			if (toolbar.hasAttribute('hidden')) {
				toolbar.setAttribute('hidden', 'true');
			} else {
				toolbar.setAttribute('collapsed', 'true');
			}
		}
	}
}

toggleToolbarButtonUpdate: function(aEvent, button_id, toolbar_id) {
	var doc = aEvent.target.ownerDocument;
	// normal toolbars use collapsed, the statusbar uses hidden
	if(aEvent.attrName == "collapsed" || aEvent.attrName == "hidden") {
		var button = doc.getElementById(button_id);
		if(button && aEvent.originalTarget.id == toolbar_id) {
			var toolbar = aEvent.originalTarget;
			toolbar_buttons.setButtonStatus(button, toolbar.collapsed || toolbar.hidden);
		}
	}
}

setToggleToolbar: function(doc, toolbar_id, button_id) {
	var button = doc.getElementById(button_id);
	if(button) {
		var toolbar = doc.getElementById(toolbar_id);
		toolbar_buttons.setButtonStatus(button, toolbar.collapsed || toolbar.hidden);
	}
}

loadToggleToolbar: function(doc, button_id, toolbar_id) {
	var toolbar = doc.getElementById(toolbar_id);
	var win = doc.defaultView;
	if(toolbar) {
		toolbar_buttons.setToggleToolbar(doc, toolbar_id, button_id);
		var tb = toolbar_buttons;
		var observer = function(mutations) {
			/*var attribute = false;
			for(var mut in mutations) {
				if(mut.type && mut.type == "attributes") {
					attribute = true;
					break;
				}
			}
			if(!attribute) return;
			var attributeName = false;
			for(var attr in mutations) {
				if(attr.attributeName && (attr.attributeName == "collapsed" || attr.attributeName == "hidden")) {
					attributeName = true;
					break;
				}
			}
			if(!attributeName) return;*/
			var button = doc.getElementById(button_id);
			if(button == null){
				return;
			}
			tb.setButtonStatus(button, toolbar.collapsed || toolbar.hidden);
		};
		var mutationObserver = new win.MutationObserver(observer);
		mutationObserver.observe(toolbar, { attributes: true, subtree: false });
	}
}
