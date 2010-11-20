// careful here, we only want to add if the are not defined
if (!this.Cc)
	this.Cc = Components.classes;
if (!this.Ci)
	this.Ci = Components.interfaces;
// the important global objects used by the extension
function toolbar_button_loader(parent, child){
	for(object_name in child){
		parent[object_name] = child[object_name];
	}
}
if(!this.toolbar_button_interfaces)
	this.toolbar_button_interfaces = {}
if(!this.toolbar_buttons)
	this.toolbar_buttons = {}
