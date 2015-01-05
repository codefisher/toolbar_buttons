function getGenericPref(branch, prefName) {
	switch (branch.getPrefType(prefName)) {
		default:
		case 0:   return undefined;					  // PREF_INVALID
		case 32:  return getUCharPref(prefName,branch);  // PREF_STRING
		case 64:  return branch.getIntPref(prefName);	// PREF_INT
		case 128: return branch.getBoolPref(prefName);   // PREF_BOOL
	}
}

function setGenericPref(branch, prefName, prefValue) {
	switch (typeof prefValue) {
		case "string":
			setUCharPref(prefName, prefValue, branch);
			return;
		case "number":
			branch.setIntPref(prefName, prefValue);
			return;
		case "boolean":
			branch.setBoolPref(prefName, prefValue);
			return;
	}
}

function pref(prefName, prefValue) {
	var defaultBranch = Services.prefs.getDefaultBranch(null);
	setGenericPref(defaultBranch ,prefName, prefValue);
}

function getUCharPref(prefName, branch) {
	branch = branch ? branch : Services.prefs;
	return branch.getComplexValue(prefName, Ci.nsISupportsString).data;
}

function setUCharPref(prefName, text, branch) {
	var string = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
	string.data = text;
	branch = branch ? branch : Services.prefs;
	branch.setComplexValue(prefName, Ci.nsISupportsString, string);
}
