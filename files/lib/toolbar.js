toggleToolbar: function(aEvent, toolbar_id, force) {
	if(!aEvent || !aEvent.originalTarget || toolbar_id != aEvent.originalTarget.parentNode.id) {
		var toolbar = document.getElementById(toolbar_id);
		try {
			// Firefox 4, mainly the bookmark toolbar button
			window.setToolbarVisibility(toolbar, toolbar.collapsed);
			if(force) {
				toolbar.collapsed = !toolbar.collapsed;
			}
		} catch(e) {
			toolbar.collapsed = !toolbar.collapsed;
			document.persist(toolbar_id, "collapsed");
		}
	}
}

toggleToolbarButtonUpdate: function(aEvent, button_id, toolbar_id) {
	// normal toolbars use collapsed, the statusbar uses hidden
	if(aEvent.attrName == "collapsed" || aEvent.attrName == "hidden") {
		var button = document.getElementById(button_id);
		if(button && aEvent.originalTarget.id == toolbar_id) {
			var toolbar = aEvent.originalTarget;
			toolbar_buttons.setButtonStatus(button, toolbar.collapsed || toolbar.hidden);
		}
	}
}

setToggleToolbar: function(toolbar_id, button_id) {
	var button = document.getElementById(button_id);
	if(button) {
		var toolbar = document.getElementById(toolbar_id);
		toolbar_buttons.setButtonStatus(button, toolbar.collapsed || toolbar.hidden);
	}
}

loadToggleToolbar: function(button_id, toolbar_id){
	var toolbar = document.getElementById(toolbar_id);
	if(toolbar) {
		toolbar_buttons.setToggleToolbar(toolbar_id, button_id);
		var mutationObserver = new window.MutationObserver(function(mutations) {
			var attribute = false;
			for(var mut in mutations) {
				attribute = attribute || (mut.type == "attributes");
			}
			if(!mut) return;
			var attributeName = false;
			for(var attr in mutations) {
				attributeName = attributeName || (attr.attributeName != "collapsed" && attr.attributeName != "hidden");
			}
			if(!attributeName) return;
			var button = window.document.getElementById(button_id);
			if(button == null) return;
			toolbar_buttons.setButtonStatus(button, toolbar.collapsed || toolbar.hidden);
		});
		mutationObserver.observe(toolbar, { attributes: true, subtree: false });
	}
}
