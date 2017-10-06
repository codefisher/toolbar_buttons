function onError(error) {
	console.log(`Error: ${error}`);
}

function onGot(items) {
	document.getElementById('new-tab').checked = (items.open_in === "tab");
	document.getElementById('window').checked = (items.open_in === "window");
	document.getElementById('hex-upper').checked = (items.hex_display === "upper");
	document.getElementById('hex-lower').checked = (items.hex_display === "lower");
	document.getElementById('copy-clipboard').checked = items.should_copy;
	document.getElementById('copy-notify').checked = items.should_notify;
	document.getElementById('color-format').value = items.copy_format;
}

function restore_options() {
	document.getElementById('new-tab').addEventListener('change', function(event) {
		if(event.target.checked) {
			browser.storage.local.set({
				open_in: "tab"
			});
		}
	});
	document.getElementById('window').addEventListener('change', function(event) {
		if(event.target.checked) {
			browser.storage.local.set({
				open_in: "window"
			});
		}
	});
	document.getElementById('hex-upper').addEventListener('change', function(event) {
		if(event.target.checked) {
			browser.storage.local.set({
				hex_display: "upper"
			});
		}
	});
	document.getElementById('hex-lower').addEventListener('change', function(event) {
		if(event.target.checked) {
			browser.storage.local.set({
				hex_display: "lower"
			});
		}
	});
	document.getElementById('copy-clipboard').addEventListener('change', function(event) {
		browser.storage.local.set({
			should_copy: event.target.checked
		});
	});
	document.getElementById('copy-notify').addEventListener('change', function(event) {
		browser.storage.local.set({
			should_notify: event.target.checked
		});
	});
	document.getElementById('color-format').addEventListener('change', function(event) {
		browser.storage.local.set({
			copy_format: event.target.value
		});
	});
	let gettingItem = browser.storage.local.get({
		open_in: "window",
		hex_display: "upper",
		should_notify: true,
		should_copy: true,
		copy_format: "hex-upper-1"
	});
	gettingItem.then(onGot, onError);
}

document.addEventListener('DOMContentLoaded', restore_options);
