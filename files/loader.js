// careful here, we only want to add if the are not defined
if (!this.Cc)
	this.Cc = Components.classes;
if (!this.Ci)
	this.Ci = Components.interfaces;
if(!this.toolbar_buttons) {
	this.toolbar_buttons = {
		interfaces: {},
		// the important global objects used by the extension
		toolbar_button_loader: function(parent, child){
			for(object_name in child){
				parent[object_name] = child[object_name];
			}
		}
	}
}
