function save_options() {
	let hide_popup = document.getElementById('hide-popup').checked;
	let tab_count = parseInt(document.getElementById('tab-count').value);
	let max_width = parseInt(document.getElementById('max-width').value);
	browser.storage.local.set({
		'hide_popup': hide_popup,
		'tab_count': tab_count,
		'max_width': max_width
	});
}

function onError(error) {
	console.log(`Error: ${error}`);
}

function onGot(items) {
	document.getElementById('hide-popup').checked = items.hide_popup;
	document.getElementById('tab-count').value = items.tab_count;
	document.getElementById('max-width').value = items.max_width;
}

function restore_options() {
	document.getElementById('hide-popup').addEventListener('change', save_options);
	document.getElementById('max-width').addEventListener('change', save_options);
	let tabCount = document.getElementById('tab-count');
	tabCount.addEventListener('change', save_options);
	tabCount.setAttribute("max", browser.sessions.MAX_SESSION_RESULTS);
	let gettingItem = browser.storage.local.get({
		hide_popup: true,
		tab_count: 10,
		max_width: 450
	});
	gettingItem.then(onGot, onError);
}

document.addEventListener('DOMContentLoaded', restore_options);
