const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

this.EXPORTED_SYMBOLS = ["customizableUI"];

/*
 * This is a reimplementation of parts of resource:///modules/CustomizableUI.jsm
 * It is used for those applications that don't have it available.
 */

function customizableUI(toolbox) {
	this.toolbox = toolbox;
}

customizableUI.prototype.createWidget = function(aProperties) {
	let document = this.toolbox.ownerDocument;
	if(aProperties.onBuild) {
		var button = aProperties.onBuild(document);
		this.toolbox.palette.appendChild(button);
	} else {
		var button = document.createElement('toolbarbutton');
		button.id = aProperties.id;
		if(aProperties.label) {
			button.setAttribute('label', aProperties.label);
		}
		if(aProperties.tooltiptext) {
			button.setAttribute('tooltiptext', aProperties.tooltiptext);
		}
		if(aProperties.onCommand) {
			button.addEventListener('command', aProperties.onCommand, false);
		}
		if(aProperties.onClick) {
			button.addEventListener('click', aProperties.onClick, false);
		}
		button.classList.add("toolbarbutton-1");
		button.classList.add("chromeclass-toolbar-additional");
		this.toolbox.palette.appendChild(button);
	}
	if(!restoreToToolbar(this.toolbox, aProperties.id)) {
		if(aProperties.defaultArea) {
			var buttonSet = this.toolbox.getAttribute('_addeddefaultset');
			var buttons = buttonSet.split(",");
			var index = buttons.indexOf(aProperties.id);
			if(index == -1) {
				this.addWidgetToArea(aProperties.id, aProperties.defaultArea, null);
				if(buttonSet) {
					buttonSet += ',' + aProperties.id;
				} else {
					buttonSet = aProperties.id;
				}
				this.toolbox.setAttribute('_addeddefaultset', buttonSet);
				document.persist(this.toolbox.id, '_addeddefaultset');
			}
		}
	}
}

function restoreToToolbar(toolbox, aWidgetId) {
	let document = toolbox.ownerDocument;
	let potentialToolbars = Array.slice(toolbox.getElementsByTagName('toolbar'));
	for (let externalToolbar of toolbox.externalToolbars) {
		if (externalToolbar.getAttribute("prependmenuitem")) {
			potentialToolbars.unshift(externalToolbar);
		} else {
			potentialToolbars.push(externalToolbar);
		}
	}
	for(var i in potentialToolbars) {
		var toolbar = potentialToolbars[i]
		var buttonSet = toolbar.getAttribute('currentset');
		var buttons = buttonSet.split(",");
		var index = buttons.indexOf(aWidgetId);
		if(index != -1) {
			var spacers = 0;
			var beforeNode = document.getElementById(buttons[index]);
			while(beforeNode == null && index < buttons.length) {
				index++;
				var nodeId = buttons[index];
				if(nodeId == 'spacer' || nodeId == 'separator' || nodeId == 'spring') {
					// in the DOM these will have some random ID, and we will not be able to find them
					// so we keep looking for the next node, and then count back.
					spacers++;
				} else {
					beforeNode = document.getElementById(nodeId);
				}
			}
			if(beforeNode == null && spacers) {
				// TODO: not quite working always yet!
				beforeNode = toolbar.childNodes[spacers-1];
			} else {
				for(var j = 0; j < spacers; j++) {
					// counting back before the spacers
					if(beforeNode == null) {
						break;
					}
					beforeNode = beforeNode.previousSibling;
				}
			}
			toolbar.insertItem(aWidgetId, beforeNode, null, false);
			toolbar.setAttribute('currentset', buttonSet);
			document.persist(toolbar.id, 'currentset');
			return true;
		}
	}
	return false;
}

customizableUI.prototype.destroyWidget = function(aWidgetId) {
	let document = this.toolbox.ownerDocument;
	var button = document.getElementById(aWidgetId);
	if(button) {
		button.parentNode.removeChild(button);
	} else {
		var buttons = this.toolbox.palette.getElementsByAttribute('id', aWidgetId);
		for(var i = 0; i < buttons.length; i++) {
			this.toolbox.palette.removeChild(buttons[i]);
		}
	}
}

customizableUI.prototype.addWidgetToArea = function(aWidgetId, aArea, aPosition) {
	// we are not yet handeling aPosition
	let document = this.toolbox.ownerDocument;
	var toolbar = document.getElementById(aArea);
	toolbar.insertItem(aWidgetId, null, null, false);
	document.persist(aArea, 'currentset');
}

customizableUI.prototype.unregisterArea = function(aName, aDestroyPlacements) {
	// is there any needed clean up we care about?
}

customizableUI.prototype.registerArea = function(aName, aProperties) {
	let document = this.toolbox.ownerDocument;
	var toolbar = document.getElementById(aName);
	if(toolbar.hasAttribute('currentset')) {
		var buttonSet = toolbar.getAttribute('currentset');
	} else {
		var buttonSet = toolbar.getAttribute('defaultset');
	}
	var buttons = buttonSet.split(",");
	for(var i in buttons) {
		toolbar.insertItem(buttons[i], null, null, false);
	}
	toolbar.setAttribute('currentset', buttonSet); // we do this to make sure we have not changed or messed up by called insertItem
	document.persist(aName, 'currentset');
}

/*
 * out own new function, needed because we need reference toolbox.
 * Thunderbird has two in the main window
 */
customizableUI.prototype.selectToolbox = function(doc, toolbox) {
	this.toolbox = toolbox;
}
