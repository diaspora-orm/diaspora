document.addEventListener('DOMContentLoaded', function () {
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
        getCompletions: function (editor, session, pos, prefix, callback) {
            var matches = [];
            if (prefix.length === 0) {
                return callback(null, matches);
            }
            if (prefix.toLowerCase().match(/pho/))
                matches.push({ name: 'PhoneBook', value: 'PhoneBook', score: 1, meta: "Collection" });
            return callback(null, matches);
        }
    };
    langTools.addCompleter(diasporaCompleter);
    function escapeHtml(str) {
        return $('<div/>').text(str).html();
    }
    Diaspora.createNamedDataSource('memoryStore', 'inMemory');
    Diaspora.createNamedDataSource('localStorage', 'browserStorage', {});
    window.Drawings = Diaspora.declareModel('drawings', {
        sources: {
            memoryStore: {
                id: 'index',
            },
        },
        attributes: {
            name: {
                type: 'string',
                required: true,
            },
            artist: 'string',
            date: 'integer',
            movement: 'string',
            type: {
                type: 'string',
                enum: [/(?:\W|^)painting(?:\W|$)/, 'sculpture', 'photography'],
            },
            medium: {
                type: 'string',
            },
            museum: 'string',
        },
    });
    window.Queries = Diaspora.declareModel('Queries', {
        sources: ['localStorage'],
        attributes: {
            query: {
                type: 'string',
                required: true
            },
            timestamp: {
                type: 'integer',
                required: true,
                default: function defaultVal() {
                    return new Date().getTime();
                }
            },
        },
    });
    var $queriesHistory = $('#queriesHistory');
    function formatDate(date) {
        var monthNames = [
            "January", "February", "March",
            "April", "May", "June", "July",
            "August", "September", "October",
            "November", "December"
        ];
        function toSize(str, filler, len) {
            var fullStr = str + '';
            while (fullStr.length < len) {
                fullStr = filler + fullStr;
            }
            return fullStr.slice(-len);
        }
        return toSize(date.getDate(), ' ', 2) + ' ' + monthNames[date.getMonth()].slice(0, 3) + '. ' + toSize(date.getHours(), '0', 2) + ':' + toSize(date.getMinutes(), '0', 2) + ':' + toSize(date.getSeconds(), '0', 2);
    }
    function refreshOldQueries() {
        $queriesHistory.empty();
        Queries.findMany({}).then(queries => {
            queries = queries.sort(function (a, b) {
                return a.timestamp - b.timestamp;
            }).slice(-10);
            queries.forEach(function (query, index) {
                var $row = $($.parseHTML(`<tr data-query-id="${query.id}"><th>${index + 1}</th><td>${escapeHtml(query.query)}</td><td>${formatDate(new Date(query.timestamp))}</td><td style="vertical-align:middle;text-align:center;"><button class="repeat btn btn-default" title="Re-execute query"><i class="glyphicon glyphicon-repeat"></i></button><button class="delete btn btn-default" title="Delete query"><i class="glyphicon glyphicon-remove"></i></button></td></tr>`));
                $row.find('.delete').click(function () {
                    query.destroy().then(refreshOldQueries);
                });
                $row.find('.repeat').click(function () {
                    console.log(query.query);
                    editor.setValue(query.query);
                    execQuery(query.query);
                });
                $queriesHistory.append($row);
            });
        });
    }
    function execQuery(query) {
        var retval = eval(query);
        var promises = [
            Queries.find({
                query: query,
            }).then(function (oldQuery) {
                if ('undefined' === typeof oldQuery) {
                    return Queries.spawn({
                        query: query,
                    }).persist();
                }
                else {
                    oldQuery.timestamp = new Date().getTime();
                    return oldQuery.persist();
                }
            }),
        ];
        if ('function' === typeof retval.then) {
            promises.push(retval.then(function (output) {
                if ('undefined' === typeof output || output === null) {
                    output = [];
                }
                else if (!output.hasOwnProperty('entities')) {
                    output = [output];
                }
                else {
                    output = output.value();
                }
                return setAllData(output);
            }));
        }
        return Promise.all(promises).then(refreshOldQueries);
    }
    var $submit = $('#execquery');
    $submit.click(function () {
        var content = editor.getValue();
        execQuery(content);
    });
    var $reset = $('#resetData');
    $reset.click(reset);
    function reset() {
        Drawings.deleteMany({}).then(() => {
            return Drawings.spawnMulti(window.transformedData.data2).persist();
        }).then(inserted => Promise.resolve(inserted.value())).then(setAllData);
    }
    function setAllData(data) {
        datatable.clear();
        datatable.rows.add(data);
        datatable.draw();
        return Promise.resolve();
    }
    window.transformedData = {
        data2: (function () {
            var acc = [];
            var sheet = data2["Feuille 1"];
            for (key in sheet) {
                var row = sheet[key];
                for (subKey in row) {
                    if (!row[subKey]) {
                        delete row[subKey];
                    }
                }
                acc.push(row);
            }
            return acc;
        }()),
    };
    var datatable;
    var config = {
        data: [],
        pageLength: 10,
        columns: window.transformedData.data2.reduce(function (acc, val) {
            var obj = val;
            for (key in obj) {
                if (obj.hasOwnProperty(key) && acc.indexOf(key) === -1 && key !== 'idHash') {
                    acc.push(key);
                }
            }
            return acc;
        }, []).map(function (key) {
            return { data: key, defaultContent: '<em>N/A</em>' };
        }),
        searching: false,
        ordering: false,
        fixedColumns: {
            leftColumn: 1,
        },
        scrollX: true,
    };
    try {
        datatable = $('#datatable').DataTable(config);
    }
    catch (e) {
        console.error(e);
    }
    Promise.all([
        refreshOldQueries(),
        reset(),
        new Promise(function (resolve) {
            editor.renderer.on('afterRender', function () {
                return resolve();
            });
        })
    ]).then(function () {
        setTimeout(function () {
            $('.lazyload').removeClass('unloaded');
        });
    }).then(() => {
        datatable.columns.adjust().draw();
    });
});
//# sourceMappingURL=tryDiaspora.js.map