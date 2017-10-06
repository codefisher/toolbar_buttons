function save_options() {
	let tab_count = parseInt(document.getElementById('tab-count').value);
	browser.storage.local.set({
		'tab_count': tab_count
	});
}

function onError(error) {
	console.log(`Error: ${error}`);
}

function onGot(items) {
	document.getElementById('tab-count').value = items.tab_count;
}

function restore_options() {
	document.getElementById('tab-count').addEventListener('change', save_options);
	var gettingItem = browser.storage.local.get({
		tab_count: 10
	});
	gettingItem.then(onGot, onError);
}

document.addEventListener('DOMContentLoaded', restore_options);
