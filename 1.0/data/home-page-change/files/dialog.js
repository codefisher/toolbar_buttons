if (window.arguments[1] && window.arguments[1].returnbutton2 == true) {
	function commonDialogOnExtra1() {
		commonDialogOnAccept();
		gCommonDialogParam.SetInt(0, 2);
		window.close();
	}

	function commonDialogOnExtra2() {
		commonDialogOnAccept();
		gCommonDialogParam.SetInt(0, 3);
		window.close();
	}
}
