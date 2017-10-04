function onError(error) {
	console.log(`Error: ${error}`);
}

function onGot(items) {
	document.getElementById('new-tab').checked = (items.open_in === "tab");
	document.getElementById('window').checked = (items.open_in === "window");
	document.getElementById('hex-upper').checked = (items.hex_display === "upper");
	document.getElementById('hex-lower').checked = (items.hex_display === "lower");
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
	let gettingItem = browser.storage.local.get({
		open_in: "window",
		hex_display: "upper",
		should_notify: true
	});
	gettingItem.then(onGot, onError);
}

document.addEventListener('DOMContentLoaded', restore_options);
