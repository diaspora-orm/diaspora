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
		tab.classList.add('active')
	});
}
window.addEventListener('hashchange', loadHash, false);

var pageTabs = [];
window.addEventListener('resize', function(){
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
		tabGroup.style.height = (maxHeight + 56) + 'px';
	});
});
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
			return info;
		});
		var maxHeight = infos.reduce(function(acc, val){
			if(acc < val.height){
				return val.height;
			}
			return acc;
		}, 0);
		tabGroup.style.height = (maxHeight + 20) + 'px';
		var nav = document.createElement('nav');
		nav.innerHTML = '<ul>' + infos.map(function(info, index){
			return '<li><a href="' + info.ref + '">' + info.label + '</a></li>';
		}).join('') + '</ul>';
		tabGroup.insertBefore(nav, tabGroup.children[0]);
		tabGroup.classList.add('tabs-init');
		tabs[0].classList.add('active');
	});
	loadHash();
});