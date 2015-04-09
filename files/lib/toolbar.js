toggleToolbar: function(aEvent, toolbar_id, force) {
	var doc = aEvent.target.ownerDocument;
	var win = doc.defaultView;
	if(!aEvent || !aEvent.originalTarget || toolbar_id != aEvent.originalTarget.parentNode.id) {
		var toolbar = doc.getElementById(toolbar_id);
		try {
			// Firefox 4, mainly the bookmark toolbar button
			win.setToolbarVisibility(toolbar, toolbar.collapsed);
			if(force) {
				toolbar.collapsed = !toolbar.collapsed;
			}
		} catch(e) {
			toolbar.collapsed = !toolbar.collapsed;
			doc.persist(toolbar_id, "collapsed");
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
		var mutationObserver = new win.MutationObserver(function(mutations) {
			var attribute = false;
			var attributeName = false;
			var aDoc = null;
			for(var mut in mutations) {
				attribute = attribute || (mut.type && mut.type == "attributes");
				attributeName = attributeName || (attr.attributeName != "collapsed" && attr.attributeName != "hidden");
				aDoc = mut.target.ownerDocument;
			}
			if(!attribute || !attributeName) {
				return;
			}
			var button = aDoc.getElementById(button_id);
			if(button == null){
				return;
			}
			toolbar_buttons.setButtonStatus(button, toolbar.collapsed || toolbar.hidden);
		});
		mutationObserver.observe(toolbar, { attributes: true, subtree: false });
	}
}
