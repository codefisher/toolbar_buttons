#include searchBarSize

SearchResizeLoad: function() {
	var searchBar = document.getElementById("search-container");
	if((!document.getElementById('tb-search-resize')
			&& !document.getElementById('tb-search-plus')
			&& !document.getElementById('tb-search-minus')) || !searchBar)
		return;
	searchBar.style.maxWidth = searchBar.width + 'px';
}

window.addEventListener("load", toolbar_buttons.SearchResizeLoad, false);e