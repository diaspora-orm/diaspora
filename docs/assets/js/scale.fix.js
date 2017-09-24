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
	pageTabs.forEach(function(tabGroup){
		var tabs = Array.prototype.slice.call(tabGroup.children).filter(function(maybeTab){
			return maybeTab.classList.contains('tab');
		});
		var maxHeight =  tabs.map(function(tab, index){
			return tab.clientHeight;
		}).reduce(function(acc, val){
			if(acc < val){
				return val;
			}
			return acc;
		}, 0);
		tabGroup.style.height = (maxHeight + 25) + 'px';
	});
}
window.addEventListener('resize', resizeTabs);
document.addEventListener('DOMContentLoaded', function(event) { 	
	pageTabs = document.querySelectorAll('.tabs');
	pageTabs.forEach(function(tabGroup){
		var tabs = Array.prototype.slice.call(tabGroup.children).filter(function(maybeTab){
			return maybeTab.classList.contains('tab');
		});
		var infos = tabs.map(function(tab, index){
			var info = {
				label: '#' + index,
				height: tab.clientHeight,
				ref: '#' + tab.getAttribute('data-ref'),
			};
			for(var i = 0; i < 6; i++){
				var title = tab.querySelector('h'+i);
				if(title){
					title.style.display = 'none';
					info.label = title.innerHTML;
					break;
				}
			}
			tab.style.opacity = "0";
			return info;
		});
		var maxHeight = infos.reduce(function(acc, val){
			if(acc < val.height){
				return val.height;
			}
			return acc;
		}, 0);
		tabGroup.style.height = (maxHeight - 10) + 'px';
		var nav = document.createElement('nav');
		nav.innerHTML = '<ul>' + infos.map(function(info, index){
			return '<li><a href="' + info.ref + '">' + info.label + '</a></li>';
		}).join('') + '</ul>';
		var navItems = nav.querySelectorAll('li');
		if(navItems.length > 0){
			navItems[0].classList.add('active');
		}
		navItems.forEach(function(li){
			li.addEventListener('click', function(){
				navItems.forEach(function(item){
					if(item !== li){
						item.classList.remove('active');
					}
				});
				li.classList.add('active');
			});
		});
		tabGroup.insertBefore(nav, tabGroup.children[0]);
		tabs[0].classList.add('active');
		tabs.forEach(function(tab){
			tab.style.opacity = "";
		});
		setTimeout(function(){
			tabGroup.classList.add('tabs-init');
		}, 100)
	});
	loadHash();
	setTimeout(resizeTabs, 100);



	$.fn.preBind = function (type, data, fn) {
		this.each(function () {
			var $this = $(this);

			$this.bind(type, data, fn);

			var currentBindings = $._data(this, 'events')[type];
			if ($.isArray(currentBindings)) {
				currentBindings.unshift(currentBindings.pop());
			}
		});
		return this;
	};
	var $subNavs = $('ul.nav > li.dropdown > ul.dropdown-menu a.dropdown-toggle');
	$subNavs.preBind('click', function(event){
		$(this).parent().children().filter('.dropdown-submenu').toggleClass('open');
		event.preventDefault();
		return false;
	});
	$subNavs.dblclick(function(even){
		window.open(this.href, '_self');
	});
});