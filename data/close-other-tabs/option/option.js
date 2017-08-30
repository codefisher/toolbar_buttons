function save_options() {
	var not_pinned = document.getElementById('not-pinned').checked;

	browser.storage.local.set({
		'not_pinned': not_pinned
	});
}

function onError(error) {
	console.log(`Error: ${error}`);
}

function onGot(items) {
	document.getElementById('not-pinned').checked = items.not_pinned;
}

function restore_options() {
	document.getElementById('not-pinned').addEventListener('change', save_options);
	let gettingItem = browser.storage.local.get({
		not_pinned: true,
	});
	gettingItem.then(onGot, onError);
}

document.addEventListener('DOMContentLoaded', restore_options);
