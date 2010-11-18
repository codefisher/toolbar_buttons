function toolbar_button_loader(parent, child){
	for(object_name in child){
		parent[object_name] = child[object_name];
	}
}