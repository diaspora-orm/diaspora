document.addEventListener('DOMContentLoaded', function(){
	jQuery = $;


	var editor = ace.edit("query");
	editor.setTheme("ace/theme/monokai");
	editor.getSession().setMode("ace/mode/javascript");
	var langTools = ace.require("ace/ext/language_tools");
	editor.setOptions({
		enableBasicAutocompletion: true,
		enableSnippets: true,
		enableLiveAutocompletion: false
	});
	var diasporaCompleter = {
		getCompletions: function(editor, session, pos, prefix, callback) {
			var matches = [];
			if (prefix.length === 0) {
				return callback(null, matches);
			}
			console.log(arguments);
			if(prefix.toLowerCase().match(/pho/))
				matches.push({name: 'PhoneBook', value: 'PhoneBook', score: 1, meta: "Collection"});
			return callback(null, matches);
		}
	}
	langTools.addCompleter(diasporaCompleter);


	function escapeHtml(str){
		return $('<div/>').text(str).html();
	}



	Diaspora.registerDataSource('tryDiaspora', 'inMemory', Diaspora.createDataSource('in-memory'));
	Diaspora.registerDataSource('tryDiaspora', 'localStorage', Diaspora.createDataSource('localstorage', {}));
	window.PhoneBook = Diaspora.declareModel('tryDiaspora', 'PhoneBook', {
		sources: {
			inMemory: {
				id: 'index',
			},
		},
		attributes:{
			id: 'Integer',
			name: 'String',
			phone: 'String',
			email: 'String',
			company: 'String',
			country: 'String',
			state: 'String',
			city: 'String',
			address: 'String',
		},
	});
	window.Queries = Diaspora.declareModel('tryDiaspora', 'Queries', {
		sources: ['localStorage'],
		attributes:{},
	});



	var $queriesHistory = $('#queriesHistory');
	function formatDate(date) {
		var monthNames = [
			"January", "February", "March",
			"April", "May", "June", "July",
			"August", "September", "October",
			"November", "December"
		];

		var day = date.getDate();
		var monthIndex = date.getMonth();
		var year = date.getFullYear();

		return day + ' ' + monthNames[monthIndex].slice(0, 3) + '. ' + year;
	}
	function refreshOldQueries(){
		$queriesHistory.empty();
		Queries.findMany({}).then(queries => {
			queries = queries.sort(function(a,b){
				return a.timestamp - b.timestamp;
			});
			queries.forEach(function(query, index){
				var $row = $($.parseHTML(`<tr data-query-id="${query.id}"><th>${ index + 1 }</th><td>${ escapeHtml(query.query) }</td><td>${ formatDate(new Date(query.timestamp)) }</td><td style="vertical-align:middle;text-align:center;"><button class="repeat btn btn-default" title="Re-execute query"><i class="glyphicon glyphicon-repeat"></i></button><button class="delete btn btn-default" title="Delete query"><i class="glyphicon glyphicon-remove"></i></button></td></tr>`));
				$row.find('.delete').click(function(){
					query.destroy().then(refreshOldQueries);
				});
				$row.find('.repeat').click(function(){
					console.log(query.query);
					editor.setValue(query.query);
					execQuery(query.query);
				});
				$queriesHistory.append($row);
			});
		});
	}




	function execQuery(query){
		var retval = eval(query);
		var promises = [
			Queries.find({
				query: query,
			}).then(function(oldQuery){
				if('undefined' === typeof oldQuery){
					return Queries.insert({
						query: query,
						timestamp: new Date().getTime(),
					});
				} else {
					oldQuery.timestamp = new Date().getTime();
					return oldQuery.persist();
				}
			}),
		];

		if('function' === typeof retval.then){
			promises.push(retval.then(function(output){
				if('undefined' === typeof output || output === null){
					output = [];
				} else if(!(output instanceof Array)){
					output = [output];
				}
				return setAllData(output);
			}));
		}

		return Promise.all(promises).then(refreshOldQueries);
	}
	var $submit = $('#execquery');
	$submit.click(function(){
		var content = editor.getValue();
		execQuery(content);
	});


	var $reset = $('#resetData');
	$reset.click(reset);
	function reset(){
		PhoneBook.deleteMany({}).then(() => {
			return PhoneBook.insertMany(data);
		}).then(setAllData);
	}
	function setAllData(data){
		datatable.clear();
		datatable.rows.add(data);
		datatable.draw();
		return Promise.resolve();
	}





	var datatable;
	var config = {
		data: [],
		pageLength: 50,
		columns: data.reduce(function(acc, val){
			var obj = val;
			for(key in obj){
				if(obj.hasOwnProperty(key) && acc.indexOf(key) === -1 && key !== 'idHash'){
					acc.push(key);
				}
			}
			return acc;
		}, ['id']).map(function(key){
			return {data:key, defaultContent: '<em>N/A</em>'};
		}),
		searching: false,
		ordering:  false,
		fixedColumns: {
			leftColumn: 1,
		},
		scrollX: true,
	};
	try{
		datatable = $('#datatable').DataTable(config);
	} catch(e){
		console.error(e);
	}
	datatable.draw();

	Promise.all([
		refreshOldQueries(),
		reset(),
		new Promise(function(resolve){
			editor.renderer.on('afterRender', function() {
				return resolve();
			});
		})
	]).then(function(){
		setTimeout(function(){
			$('.lazyload').removeClass('unloaded');
		});
	})
});