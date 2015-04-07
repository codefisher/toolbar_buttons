tabListDropDown: function(item) {
	while (item.firstChild) {
		item.removeChild(item.firstChild);
	}
	var tabcontainer = document.getElementById("content").mTabContainer;
	var tabs = tabcontainer.childNodes;
	//tabcontainer._stopAnimation();
	for ( var i = 0; i < tabs.length; i++) {
		var menuItem = document.createElement("menuitem");
		var curTab = tabs[i];
		if (curTab.selected) {
			menuItem.setAttribute("selected", "true");
		}
		menuItem.setAttribute("class", "menuitem-iconic alltabs-item");
		menuItem.setAttribute("label", curTab.label);
		menuItem.setAttribute("crop", curTab.getAttribute("crop"));
		menuItem.setAttribute("image", curTab.getAttribute("image"));
		if (curTab.hasAttribute("busy")) {
			menuItem.setAttribute("busy", curTab.getAttribute("busy"));
		}
		var URI = curTab.linkedBrowser.currentURI.spec;
		menuItem.setAttribute("statustext", URI);
		/*try {
			curTab.mCorrespondingMenuitem = menuItem;
			curTab.addEventListener("DOMAttrModified", item, false);
		} catch (e) {
		}*/
		menuItem.tab = curTab;
		menuItem.addEventListener("command",
			function() {
				var tabcontainer = document.getElementById("content").mTabContainer;
				tabcontainer.selectedItem = this.tab;
				tabcontainer.mTabstrip.scrollBoxObject.ensureElementIsVisible(this.tab);
			}, false);
		item.appendChild(menuItem);
	}
}