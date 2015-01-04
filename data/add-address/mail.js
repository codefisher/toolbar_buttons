addContact: function() {
	var detailsNodes = document.getElementById('expandedfromBox').emailAddresses.firstChild;
	if (detailsNodes.cardDetails.card) {
		window.EditContact(detailsNodes)
	} else {
		window.AddContact(detailsNodes);
	}
}

