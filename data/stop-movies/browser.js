#include PreferenceWatcher
#include extesnionPrefToggleStatus
#include cssFileToUserContent
#include loadUserContentSheet
#include checkBrowserReload

stopMovies: function(button) {
	toolbar_buttons.extesnionPrefToggleStatus(button, "movies");
	BrowserReload();
}

setMoviesState: function(state) {
	toolbar_buttons.cssFileToUserContent("chrome://{{chrome_name}}/content/movies.css", state, false, "stop-movies");
	document.getElementById("stop-movies").setAttribute("activated", state);
}

window.addEventListener("load", function(e) {
	var prefWatch = new toolbar_buttons.PreferenceWatcher();
	prefWatch.startup("{{pref_root}}movies", null, toolbar_buttons.setMoviesState);
	toolbar_buttons.loadUserContentSheet("chrome://{{chrome_name}}/content/movies.css", "movies", "stop-movies");
	window.addEventListener("unload", function(e) {
		prefWatch.shutdown();
	}, false);
}, false);