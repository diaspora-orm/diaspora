fixScale = function(doc) {

	var addEvent = 'addEventListener',
		type = 'gesturestart',
		qsa = 'querySelectorAll',
		scales = [1, 1],
		meta = qsa in doc ? doc[qsa]('meta[name=viewport]') : [];

	function fix() {
		meta.content = 'width=device-width,minimum-scale=' + scales[0] + ',maximum-scale=' + scales[1];
		doc.removeEventListener(type, fix, true);
	}

	if ((meta = meta[meta.length - 1]) && addEvent in doc) {
		fix();
		scales = [.25, 1.6];
		doc[addEvent](type, fix, true);
	}

};

function loadHash(){
	var tabs = document.querySelectorAll('.tabs .tab[data-ref="' + location.hash.slice(1) + '"]');
	tabs.forEach(function(tab){
		var parent = tab.parentElement;
		parent.querySelectorAll('.tab.active').forEach(function(activeTab){
			activeTab.classList.remove('active');
		});
		tab.classList.add('active');
	});
	document.querySelectorAll('.tabs nav li a[href="' + location.hash + '"]').forEach(function(a){
		var li = a.parentElement;
		li.parentElement.querySelectorAll('.active').forEach(function(otherLi){
			otherLi.classList.remove('active');
		});
		li.classList.add('active');
	});
}
window.addEventListener('hashchange', loadHash, false);

var pageTabs = [];
function resizeTabs(){
	pageTabs.each(function(idx, tabGroup){
		tabGroup = $(tabGroup);
		var tabs = tabGroup.children().filter(function(idx, maybeTab){
			return maybeTab.classList.contains('tab');
		});
		var maxHeight =  tabs.map(function(idx, tab){
			return $(tab).height();
		}).toArray().reduce(function(acc, val){
			if(acc < val){
				return val;
			}
			return acc;
		}, 0);
		tabGroup.css({
			height: maxHeight + 25
		});
	});
}
$(window).resize(resizeTabs);
$(document).ready(function(event) { 	
	pageTabs = $('.tabs');
	pageTabs.each(function(idx, tabGroup){
		tabGroup = $(tabGroup);
		var tabs = tabGroup.children().filter(function(idx, maybeTab){
			return maybeTab.classList.contains('tab');
		});
		var infos = tabs.map(function(idx, tab){
			tab = $(tab);
			var info = {
				label: '#' + idx,
				height: tab.height(),
				ref: '#' + tab.data('ref'),
			};
			for(var i = 0; i < 6; i++){
				var title = tab.find('h'+i).first();
				if(title.length > 0){
					title.css({
						display: 'none'
					});
					info.label = title.html();
					break;
				}
			}
			tab.css({
				opacity: 0
			});
			return info;
		}).toArray();
		var maxHeight = infos.reduce(function(acc, val){
			if(acc < val.height){
				return val.height;
			}
			return acc;
		}, 0);
		tabGroup.css({
			height: maxHeight - 10,
		});
		var nav = $($.parseHTML('<nav><ul>' + infos.map(function(info, index){
			return '<li><a href="' + info.ref + '">' + info.label + '</a></li>';
		}).join('') + '</ul></nav>'));
		var navItems = nav.find('li');
		if(navItems.length > 0){
			navItems.first().addClass('active');
		}
		navItems.click(function(){
			var item = this;
			navItems.filter(function(){
				return item !== this;
			}).removeClass('active')
			$(item).addClass('active');
		});
		// Todo
		tabGroup.prepend(nav);
		tabs.first().addClass('active');
		tabs.css({
			opacity: '',
		});
		setTimeout(function(){
			tabGroup.addClass('tabs-init');
		}, 100)
	});
	loadHash();
	setTimeout(resizeTabs, 100);



	$.fn.preBind = function (type, data, fn) {
		this.each(function (idx, item) {
			item = $(item);

			item.bind(type, data, fn);

			var currentBindings = $._data(this, 'events')[type];
			if ($.isArray(currentBindings)) {
				currentBindings.unshift(currentBindings.pop());
			}
		});
		return this;
	};
	$('ul.nav > li.dropdown > ul.dropdown-menu a.dropdown-toggle').preBind('click', function(event){
		$(this).parent().children().filter('.dropdown-submenu').toggleClass('open');
		event.preventDefault();
		return false;
	});
	$('ul.nav a.dropdown-toggle').dblclick(function(even){
		window.open(this.href, '_self');
	});


	var table = $('#container > table');
	if(table.length > 0){
		table.tableHeadFixer({left: 1, head: false});
	}
});