const Ci = Components.interfaces;
const Cu = Components.utils;
const Cc = Components.classes;

Cu.import('resource://gre/modules/Services.jsm');
Cu.import('resource://gre/modules/FileUtils.jsm');

function stringManager() {
	this.db_table = null;
	this.tree = null;
	this.query = null;
	this.db_connection = null;

	this.sort_type = "name";
	this.sort_order = "ASC"; //DESC
	this.edit_id = null;

	this.onLoad = function() {
		var args = window.arguments[0];
		document.getElementById('StringDialog').setAttribute('title', args.title);
		this.db_table = args.db_table;
		this.tree = document.getElementById('string-tree');
		this.query = document.getElementById('tree-query');
		
		if(args.type == "file") {
			document.getElementById('string-pref-browse').removeAttribute('hidden');
		}

		var file = FileUtils.getFile("ProfD", ["toolbar_buttons.sqlite"]);
		this.db_connection = Services.storage.openDatabase(file);

		this.query.textContent = this.makeQuery();
		this.tree.builder.rebuild();
		
		this.tree.view.setCellText = function(aRow, aCol, aValue) {
			var id = gStringManager.tree.view.getCellText(aRow, gStringManager.tree.columns.getNamedColumn('rowid'))
	    	let editrow = gStringManager.db_connection.createAsyncStatement("UPDATE " + gStringManager.db_table + " SET " + aCol.id + " = :value WHERE rowid=" + id);
	    	editrow.params.value = aValue;
			editrow.executeAsync({
				handleResult: function(aResultSet) { },	
				handleError: function(aError) { },			
				handleCompletion: function(aReason) {
			  		gStringManager.tree.builder.rebuild();
				}
			});
	    	editrow.finalize();
		};
	};
	
	this.edit = function() {
		var start = new Object();
		var end = new Object();
		var numRanges = this.tree.view.selection.getRangeCount();
		for (var t = 0; t < numRanges; t++){
		  this.tree.view.selection.getRangeAt(t,start,end);
		  for (var v = start.value; v <= end.value; v++){
		  	document.getElementById('string-name').value = this.tree.view.getCellText(v, this.tree.columns.getNamedColumn('name'));
		  	document.getElementById('string-value').value = this.tree.view.getCellText(v, this.tree.columns.getNamedColumn('value'));
		  	this.edit_id = this.tree.view.getCellText(v, this.tree.columns.getNamedColumn('rowid'));
		  	document.getElementById('string-pref-add').setAttribute('hidden', true);
			document.getElementById('string-pref-save').removeAttribute('hidden');
		  	return;
		  }
		}
	};
	
	this.save = function() {
		if(!this.edit_id) return;
		var name = document.getElementById('string-name').value;
		var value = document.getElementById('string-value').value;
		if(name && value) {
			let stmt = this.db_connection.createAsyncStatement("UPDATE " + this.db_table + " SET name = :name, value = :value WHERE rowid = :rowid");
			stmt.params.value = value;
			stmt.params.name = name;
			stmt.params.rowid = this.edit_id;
			stmt.executeAsync({
				handleResult: function(aResultSet) { },	
				handleError: function(aError) { },			
				handleCompletion: function(aReason) {
					this.edit_id = null;
					document.getElementById('string-name').value = '';
					document.getElementById('string-value').value = '';
					document.getElementById('string-pref-save').setAttribute('hidden', true);
					document.getElementById('string-pref-add').removeAttribute('hidden');
			  		gStringManager.tree.builder.rebuild();
				}
			});
			stmt.finalize();
		}
	};
	
	this.browse = function() {
		var filePicker = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
		filePicker.init(window, null, Ci.nsIFilePicker.modeOpen);
		filePicker.appendFilters(Ci.nsIFilePicker.filterAll | Ci.nsIFilePicker.filterApps);
		filePicker.open({
			done:  function(aResult) {
				if(aResult != Ci.nsIFilePicker.returnCancel) {
					document.getElementById('string-value').value = filePicker.file.path;
				}
			}
		});
	};
	
	
	this.makeQuery = function() {
		return "SELECT rowid, name, value FROM " + this.db_table + " ORDER BY " + this.sort_type + " " + this.sort_order;
	};
	
	this.addNew = function() {
		var nameNode = document.getElementById('string-name');
		var valueNode = document.getElementById('string-value');
		var name = nameNode.value;
		var value = valueNode.value;
		if(name && value) {
			let stmt = this.db_connection.createAsyncStatement("INSERT INTO " + this.db_table + " (name, value) VALUES(:name, :value)");
			stmt.params.value = value;
			stmt.params.name = name;
			
			stmt.executeAsync({
				handleResult: function(aResultSet) { },	
				handleError: function(aError) { },			
				handleCompletion: function(aReason) {
					document.getElementById('string-name').value = '';
					document.getElementById('string-value').value = '';
			  		gStringManager.tree.builder.rebuild();
				}
			});
			stmt.finalize();			
		}
	};
	
	this.delete = function() {
		var start = new Object();
		var end = new Object();
		var numRanges = this.tree.view.selection.getRangeCount();
		var itemIds = [];
		for (var t = 0; t < numRanges; t++){
		  this.tree.view.selection.getRangeAt(t,start,end);
		  for (var v = start.value; v <= end.value; v++){
		  	itemIds.push(this.tree.view.getCellText(v, this.tree.columns.getNamedColumn('rowid')));
		  }
		}
		for(var i in itemIds) {
		  	var stmt = this.db_connection.createStatement("DELETE FROM " + this.db_table + " WHERE rowid=:rowid");
		  	stmt.params.rowid = itemIds[i];
		  	stmt.execute();
		  	this.tree.builder.rebuild();
		}
	};

	this.onPermissionSort = function(sort_type) {
		// nsIXULTreeBuilder (tree.builder) also has a sort method.
		if(this.sort_type == sort_type) {
			if(this.sort_order == "ASC") {
				this.sort_order = "DESC";
			} else {
				this.sort_order = "ASC";
			}
		}
		//this.tree.setAttribute("sortDirection", this.sort_order == "ASC" ? "ascending" : "descending");
		//this.tree.setAttribute("sortResource", sort_type + '-col');
		this.sort_type = sort_type;
		this.query.textContent = this.makeQuery();
		this.tree.builder.rebuild();
	};

	this.uninit = function() {
		
	};
};

var gStringManager = new stringManager();

