function save_options() {
	var show_popup = document.getElementById('show-popup').checked;
	browser.storage.local.set({
		'show_popup': show_popup,
	});
}

function onError(error) {
	console.log(`Error: ${error}`);
}

function onGot(items) {
	document.getElementById('show-popup').checked = items.show_popup;
}

function restore_options() {
	document.getElementById('show-popup').addEventListener('change', save_options);
	var gettingItem = browser.storage.local.get({
		show_popup: false,
	});
	gettingItem.then(onGot, onError);
}

document.addEventListener('DOMContentLoaded', restore_options);
