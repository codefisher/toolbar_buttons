function save_options() {
	var should_confirm = !document.getElementById('no-prompt').checked;
	var should_notify = document.getElementById('notify').checked;

	browser.storage.local.set({
		'should_confirm': should_confirm,
		'should_notify': should_notify
	});
}

function onError(error) {
	console.log(`Error: ${error}`);
}

function onGot(items) {
	document.getElementById('no-prompt').checked = !items.should_confirm;
	document.getElementById('notify').checked = items.should_notify;
}

function restore_options() {
	document.getElementById('no-prompt').addEventListener('change', save_options);
	document.getElementById('notify').addEventListener('change', save_options);

	var gettingItem = browser.storage.local.get({
		should_confirm: true,
		should_notify: true,
	});
	gettingItem.then(onGot, onError);
}

document.addEventListener('DOMContentLoaded', restore_options);
