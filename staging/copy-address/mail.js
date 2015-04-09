copyAddress: function(event) {
	var doc = event.target.ownerDocument;
	var win = doc.defaultView;
	var detailsNodes = doc.getElementById('expandedfromBox').emailAddresses.firstChild;
	win.CopyEmailNewsAddress(detailsNodes);
}

