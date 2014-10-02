var show_details = false;

function showButtonDetails() {
	if(show_details)
		$("#button_list").removeClass("show-details");
	else
		$("#button_list").addClass("show-details");
	show_details = !show_details;
}

function loadFavIcons() {
	$.ajax({
		url: '/toolbar_button/get_icons/',
		type: "POST",
		data: $('#link-button-form').serialize(),
		dataType: "html",
		success: function(msg){
			if(msg == "fail") {
				$('#favicon-icon-type').attr("disabled", "true");
				$('#favicons').html("There are no favicons for this site.");
			} else {
				$('#favicon-icon-type').removeAttr("disabled");
				$('#favicons').html(msg);
			}
		},
		error: function(jqXHR, textStatus, errorThrown){
			$('#favicon-icon-type').attr("disabled", "true");
			$('#favicons').html("There are no favicons for this site.");
		}
	});
	return true;
}

function focusSet(item, value) {
	if(item.value== value)
		item.value = '';
}

function blurSet(item, value) {
	if(item.value == '')
		item.value = value;
}