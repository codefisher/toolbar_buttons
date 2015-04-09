SearchResizeLoad: function(doc) {
	var searchBar = doc.getElementById("search-container");
	if((!doc.getElementById('tb-search-resize')
			&& !doc.getElementById('tb-search-plus')
			&& !doc.getElementById('tb-search-minus')) || !searchBar)
		return;
	searchBar.style.maxWidth = searchBar.width + 'px';
}

toolbar_buttons.SearchResizeLoad(document);