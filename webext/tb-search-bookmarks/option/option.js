function save_options() {
	let new_tab = document.getElementById('new-tab').checked;
	browser.storage.local.set({
		'new_tab': new_tab
	});
}

function onError(error) {
	console.log(`Error: ${error}`);
}

function onGot(items) {
	document.getElementById('new-tab').checked = items.new_tab;
}

function restore_options() {
	document.getElementById('new-tab').addEventListener('change', save_options);
	let gettingItem = browser.storage.local.get({
		new_tab: false
	});
	gettingItem.then(onGot, onError);
}

document.addEventListener('DOMContentLoaded', restore_options);
