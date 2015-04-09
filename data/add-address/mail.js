addContact: function(event) {
	var doc = event.target.ownerDocument;
	var win = doc.defaultView;
	var detailsNodes = doc.getElementById('expandedfromBox').emailAddresses.firstChild;
	if (detailsNodes.cardDetails.card) {
		win.EditContact(detailsNodes)
	} else {
		win.AddContact(detailsNodes);
	}
}

