function save_options() {
	var hide_popup = document.getElementById('hide-popup').checked;
	browser.storage.local.set({
		'hide_popup': hide_popup,
	});
}

function onError(error) {
	console.log(`Error: ${error}`);
}

function onGot(items) {
	document.getElementById('hide-popup').checked = items.hide_popup;
}

function restore_options() {
	document.getElementById('hide-popup').addEventListener('change', save_options);
	var gettingItem = browser.storage.local.get({
		hide_popup: true,
	});
	gettingItem.then(onGot, onError);
}

document.addEventListener('DOMContentLoaded', restore_options);
