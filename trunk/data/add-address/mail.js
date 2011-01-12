addContact: function() {
	var detailsNodes = document.getElementById('expandedfromBox').emailAddresses.firstChild;
	if (detailsNodes.cardDetails.card) {
		EditContact(detailsNodes)
	} else {
		AddContact(detailsNodes);
	}
}

