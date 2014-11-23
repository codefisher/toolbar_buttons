var show_details = false;

function showButtonDetails() {
	if(show_details)
		$("#button_list").removeClass("show-details");
	else
		$("#button_list").addClass("show-details");
	show_details = !show_details;
}

function setSuggestions() {
	$("#suggestion-box").hide();
	$(".button-checkbox").click(updateSuggestions);
}

function updateSuggestions() {
	$.ajax({
		url: '/toolbar_button/suggestions/',
		type: "GET",
		data: $('#tbutton-form').serialize() + "&count=5",
		dataType: "json",
		success: function(data){
			var suggestsions = $("#suggestsions");
			suggestsions.empty();
			var show = false;
			for(var item in data) {
				var title = $('#' + data[item].name + '-list-item .button-name');
				if(!title.length) {
					continue;
				}
				show = true;
				title = title.clone();
				var image = $('#' + data[item].name + '-list-item .button-info img').clone();
				var li = $('<li></li>');
				var label = $('<label></label>');
				var checkbox = $('<input type="checkbox">').attr('value', data[item].name);
				label.click(function() {
					var id = $(this).children('input')[0].value;
					$('#' + id + '-checkbox').prop('checked', true);
					updateSuggestions();
				});
				label.append(checkbox);
				label.append(image);
				label.append(title);
				li.append(label);
				suggestsions.append(li);
			}
			if(show) {
				$("#suggestion-box").show();
			} else {
				$("#suggestion-box").hide();
			}
		},
		error: function(jqXHR, textStatus, errorThrown){
			$("#suggestion-box").hide();
		}
	});
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