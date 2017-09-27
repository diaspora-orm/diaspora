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
		sources: ['inMemory'],
		attributes:{},
	});
	window.Queries = Diaspora.declareModel('tryDiaspora', 'Queries', {
		sources: ['localStorage'],
		attributes:{},
	});



	var $queriesHistory = $('#queriesHistory');
	function refreshOldQueries(){
		$queriesHistory.empty();
		Queries.findMany({}).then(queries => {
			queries = queries.sort(function(a,b){
				return a.timestamp - b.timestamp;
			});
			queries.forEach(function(query, index){
				$queriesHistory.append($.parseHTML(`<tr><th>${ index + 1 }</th><td>${ escapeHtml(query.query) }</td></tr>`));
			});
		});
	}
	function execQuery(query){
		var retval = eval(content);
		var promises = [
			Queries.update({
				query: query,
			}, {
				timestamp: new Date().getTime(),
			}).then(function(updatedQuery){
				if('undefined' === typeof updatedQuery){
					return Queries.insert({
						query: query,
						timestamp: new Date().getTime(),
					});
				} else {
					return Promise.resolve();
				}
			}),
		];

		if('function' === typeof retval.then){
			promises.push(retval.then(output => {
				if('undefined' === typeof output || output === null){
					output = [];
				} else if(!(output instanceof Array)){
					output = [output];
				}
				datatable.clear();
				datatable.rows.add(output);
				datatable.draw();
			}));
		}

		return Promise.all(promises).then(refreshOldQueries);
	}
	var $submit = $('#execquery');
	$submit.click(function(){
		var content = editor.getValue();
		execQuery(content);
	});

	PhoneBook.insertMany(data).then(inserted => {
		var config = {
			data: inserted,
			pageLength: 50,
			columns: inserted.reduce(function(acc, val){
				var obj = val.toObject();
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
		console.log(config);
		try{
			datatable = $('#datatable').DataTable(config);
		} catch(e){
			console.error(e);
		}
		datatable.draw();
		return PhoneBook.find({name: 'Mario Rivas'});
	}).then(console.log.bind(console)).catch(console.error.bind(console));

	var datatable;

	refreshOldQueries();
});