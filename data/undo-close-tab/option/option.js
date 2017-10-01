function save_options() {
	let hide_popup = document.getElementById('hide-popup').checked;
	let tab_count = parseInt(document.getElementById('tab-count').value);
	browser.storage.local.set({
		'hide_popup': hide_popup,
		'tab_count': tab_count
	});
}

function onError(error) {
	console.log(`Error: ${error}`);
}

function onGot(items) {
	document.getElementById('hide-popup').checked = items.hide_popup;
	document.getElementById('tab-count').value = items.tab_count;
}

function restore_options() {
	document.getElementById('hide-popup').addEventListener('change', save_options);
	document.getElementById('tab-count').addEventListener('change', save_options);
	var gettingItem = browser.storage.local.get({
		hide_popup: true,
		tab_count: 10
	});
	gettingItem.then(onGot, onError);
}

document.addEventListener('DOMContentLoaded', restore_options);
