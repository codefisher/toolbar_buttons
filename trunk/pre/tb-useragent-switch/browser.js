openUserAgentMenu: function(event, aMenu) {
	if(!toolbar_buttons.database_connection) {
		let file = FileUtils.getFile("ProfD", ["toolbar_buttons.sqlite"]);
		toolbar_buttons['database_connection'] = Services.storage.openDatabase(file);
	}
	var sep;
	var defaultItem;
	for(var node in aMenu.childNodes) {
		if(aMenu.childNodes[node].id == 'tb-useragent-switch-config-sep') {
			sep = aMenu.childNodes[node];
		} else if(aMenu.childNodes[node].id == 'tb-useragent-default'){
			defaultItem = aMenu.childNodes[node];
		}
	}
	while(sep.previousSibling.generated) {
		aMenu.removeChild(sep.previousSibling);
	}
	
	var currentValue = '';
	try {
		currentValue = toolbar_buttons.interfaces.PrefBranch.getCharPref('general.useragent.override');
	} catch(e) {}
	defaultItem.setAttribute('checked', currentValue == '');
	
	let stmt = toolbar_buttons.database_connection.createAsyncStatement("SELECT rowid, name, value FROM user_agent_strings ORDER BY name");

	stmt.executeAsync({
		handleResult: function(aResultSet) {
			for (let row = aResultSet.getNextRow();
				row;
				row = aResultSet.getNextRow()) {
		
				let name = row.getResultByName("name");
				let value = row.getResultByName("value");
				var menuItem = document.createElement("menuitem");
				menuItem.setAttribute("label", name);
				menuItem.setAttribute("type", "checkbox");
				if(currentValue == value) {
					menuItem.setAttribute('checked', true);
				}
				menuItem.userAgent = value;
				menuItem.generated = true;
				menuItem.addEventListener("command", toolbar_buttons.setUserAgent, false);
				aMenu.insertBefore(menuItem, sep);
			}
		},
	
		handleError: function(aError) {
		},
		
		handleCompletion: function(aReason) {
		}
	});
	stmt.finalize();
}

setUserAgent: function(event) {
	toolbar_buttons.interfaces.PrefBranch.setCharPref('general.useragent.override', event.originalTarget.userAgent);
}

resetUserAgentString: function() {
	toolbar_buttons.interfaces.PrefBranch.clearUserPref('general.useragent.override');
}

openUserAgentSettings: function() {
	var stringBundle = toolbar_buttons.interfaces.StringBundleService
				.createBundle("chrome://{{chrome_name}}/locale/{{locale_file_prefix}}button.properties");
	var title = stringBundle.GetStringFromName("tb-useragent-switch.label");
	var arguments = {
		title: title,
		type: "string",
		db_table: "user_agent_strings",
	};
	window.openDialog("chrome://{{chrome_name}}/content/files/string-preference.xul",
			"UserAgent:Permissions", "chrome,centerscreen,dialog=no,resizable", arguments);
}

setDefaultUserAgents: function() {
	var defaultData = [
		["Chrome 41", "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36"],
		["Internet Explorer 11", "Mozilla/5.0 (compatible, MSIE 11, Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko"],
		["Internet Explorer 8", "Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; GTB7.4; InfoPath.2; SV1; .NET CLR 3.3.69573;)"],
		["Opera 12", "Opera/9.80 (Windows NT 6.0) Presto/2.12.388 Version/12.14"],
		["Googlebot", "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"],
	]
	let file = FileUtils.getFile("ProfD", ["toolbar_buttons.sqlite"]);
	toolbar_buttons['database_connection'] = Services.storage.openDatabase(file);
	let stmt = toolbar_buttons.database_connection.createAsyncStatement("INSERT INTO user_agent_strings (name, value) VALUES(:name, :value)");
	let params = stmt.newBindingParamsArray();
	for(var i in defaultData) {
		let bp = params.newBindingParams();
		bp.bindByName("name", defaultData[i][0]);
		bp.bindByName("value", defaultData[i][1]);
		params.addParams(bp);
	}
	stmt.bindParameters(params);
	stmt.executeAsync();
	stmt.finalize();
}

toolbar_buttons.setUpStringDatabase("user_agent_strings", toolbar_buttons.setDefaultUserAgents);
