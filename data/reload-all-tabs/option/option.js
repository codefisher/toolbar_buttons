function save_options() {
	var bypass_cache = document.getElementById('bypass-cache').checked;

	browser.storage.local.set({
		'bypass_cache': bypass_cache
	});
}

function onError(error) {
	console.log(`Error: ${error}`);
}

function onGot(items) {
	document.getElementById('bypass-cache').checked = items.bypass_cache;
}

function restore_options() {
	document.getElementById('bypass-cache').addEventListener('change', save_options);
	let gettingItem = browser.storage.local.get({
		bypass_cache: false,
	});
	gettingItem.then(onGot, onError);
}

document.addEventListener('DOMContentLoaded', restore_options);
