function startup(data, reason) {
	setDefaultPrefs();
}

function shutdown(data, reason) {
	
}


function install(data, reason) {
	
}

function uninstall(data, reason) {
	
}


const PREF_BRANCH = "{{pref_root}}";
const PREFS = {
	{{prefs}}
};

function setDefaultPrefs() {
  let branch = Services.prefs.getDefaultBranch(PREF_BRANCH);
  for (let [key, val] in Iterator(PREFS)) {
    switch (typeof val) {
      case "boolean":
        branch.setBoolPref(key, val);
        break;
      case "number":
        branch.setIntPref(key, val);
        break;
      case "string":
        branch.setCharPref(key, val);
        break;
    }
  }
}
