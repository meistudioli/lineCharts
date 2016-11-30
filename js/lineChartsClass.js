Number.isInteger = Number.isInteger || function(value) {
 	return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
};

var lineCharts = function(id, data) {
	var buffer, e, host, ins;
	this.id = id;
	this.Data = data;
	this.Ens = {};
	host = (typeof this.Data.wrapper == 'string') ? document.querySelector(this.Data.wrapper) : this.Data.wrapper;
	if (!this.determine() || !host) return;
	this.Ens.host = host;
	this.Ens.callBacks = [];
	this.Data.size = getSize(host);
	this.Data.padding = [10, 10, 30, 60];//top, right, bottom, left
	this.Data.viewBox = [0, 0].concat(this.Data.size);
	this.Data.boardsSize = [];
	this.Data.iid = '';
	this.Data.CSV = [];
	this.Data.PNG = false;

	//init
	buffer = mk();
	e = {};
	ins = this;

	host.Data = { ClassID:this.id };
	if (!host.id) host.id = 'lineCharts-' + this.id + getRand(1, 10000);
	buffer = this.template.cloneNode(true);
	if (this.wc.ShadowDOM) {
		e.root = host[this.wc.ShadowDOM]();
		e.root.innerHTML = '<style>' + this.cssStr + '</style>';
		this.Ens.sheet = e.root.querySelector('style');
		e.root.appendChild(buffer);
	} else {
		empty(host);
		host.appendChild(mk('', {tag:'h3', att:{innerHTML:'lineCharts'}}));
		host.appendChild(buffer);
		e.root = host;
	}//end if

	//hooks
	this.Ens.svg = e.root.querySelector('svg');
	this.Ens.grids = e.root.querySelector('.grids');
	this.Ens.labels = e.root.querySelector('.labels');
	this.Ens.lines = e.root.querySelector('.lines');
	this.Ens.trackers = e.root.querySelector('.trackers');
	this.Ens.rect = e.root.querySelector('defs clipPath rect');
	this.Ens.boards = e.root.querySelector('.boards');
	this.Ens.subject = this.Ens.boards.querySelector('h3');
	this.Ens.boardsLists = this.Ens.boards.querySelector('ul');
	this.Ens.boardsList = [];
	this.Ens.boards.id = 'lineCharts-boards-' + this.id + getRand(1, 10000);
	this.Ens.export = e.root.querySelector('.export');
	this.Ens.assistant = e.root.querySelector('.assistant');
	
	e.clipPathId = 'chartClipPath-' + getRand(1, 10000);
	e.root.querySelector('clipPath').id = e.clipPathId ;
	this.Ens.lines.setAttribute('clip-path', 'url(#'+e.clipPathId +')');

	//assistant
	if (this.Ens.assistant) {
		this.Ens.assistant.id = 'lineCharts-' + this.id + '-assistant-' + getRand(1, 10000);
		e.sets = [
			{
				key: 'export-csv',
				text: 'Export CSV file',
				download: 'my_line_chart_data.csv',
				title: 'export line chart data'
			},
			{
				key: 'download',
				text: 'Save as image',
				download: 'line_chart.png',
				title: 'save as image (png)'
			}
		];

		this.Ens.menu = {};
		e.sets.forEach(
			function(set) {
				var li, a;
				
				li = mk('', {tag:'li'});
				this.Ens.assistant.appendChild(li);
				a = mk(set.key, {tag:'a'});
				a.href = '#' + set.key;
				a.textContent = set.text;
				a.download = set.download;
				// a.title = set.title;
				li.appendChild(a);
				this.Ens.menu[set.key] = a;
			}
		, this);

		this.Ens.svg.addEventListener('contextmenu', this.eActG, false);
		this.Ens.assistant.addEventListener('click',
			function(evt) {
				var obj;

				obj = tNa(evt, 'a');
				if (!obj.t) return;

				ins.hideContextmenu();
				switch (obj.t.className) {
					case 'export-csv':
						ins.i13n('lineChartsAct', 'export');
						break;
					case 'download':
						ins.i13n('lineChartsAct', 'saveAs');
						break;
				}//end switch
			}
		, false);
		this.Ens.assistant.addEventListener('contextmenu',
			function(evt) {
				stopEvents(evt);
			}
		, false);
	}//end if

	//evt
	['mouseover', 'mouseout', 'mousemove'].forEach(
		function(evt) {
			this.Ens.trackers.addEventListener(evt, this.eActG, false);
		}
	, this);
	if (this.Ens.export) {
		// ins = this;
		this.Ens.export.addEventListener('click',
			function() {
				ins.hideContextmenu();
				ins.i13n('lineChartsAct', 'export');
			}
		, false);
		host.setAttribute('export', 'export');
	}//end if

	// method bundle
	if (!this.wc.CustomElements) {
		Object.defineProperties(this.Ens.host, lineCharts.prototype.properties);
		//attrChange
		if (this.observer) {
			e.config = {
				attributes: true
			};
			this.observer.observe(host, e.config);
		}//end if		
	}//end if

	//clear
	for (var i in e) e[i] = null;
	e = null;

	//remove hidden
	host.removeAttribute('hidden');

	//isReady
	this.Data.isReady = true;
	this.render(true);

	//i13n
	this.i13n('moduleView', 'lineCharts');
};

lineCharts.prototype = {
	tagname: 'line-charts',
	dependencies: [
		'createCSSClass'
	],
	colorStamp: [
		'#2cbcff',
		'#6a6acc',
		'#46c9ae',
		'#3c92e8',
		'#de69e2'
	],
	defColor: {
		axisX: 'rgba(192,208,224,1)',
		axisY: 'rgba(246,246,246,1)',
		label: '#787d82',
		tracker: '#d7dadb',
		summary: '#e8f6f5'
	},
	determine: function() {
		if (typeof lineCharts.prototype.isSupport == 'undefined') {
			var anis = isAniSupport(), css = [], e = {};

			lineCharts.prototype.tagP = new RegExp(this.tagname, 'i');//tagName pattern
			lineCharts.prototype.anis = anis;
			lineCharts.prototype.wc = supportsWebComponents();
			lineCharts.prototype.isSupport = true;
			lineCharts.prototype.observer = '';
			lineCharts.prototype.properties = {};
			lineCharts.prototype.NS = 'http://www.w3.org/2000/svg';
			lineCharts.prototype.download = (typeof mk('', {tag:'a'}).download != 'undefined') ? true : false;
			lineCharts.prototype.URLObj = window.URL || window.webkitURL;

			//animation
			if (typeof anis != 'undefined') {
				e.gpu = anis.transform+':translateZ(0);';
				e.trackerB = anis.transition + ':opacity 150ms ease;will-change:left,top,opacity;';
			} else {
				e.gpu = '';
				e.trackerB = '';
			}//end if

			//css
			e.scope = (this.wc.ShadowDOM) ? '' : this.tagname + ' ';
			createCSSClass(this.tagname, 'position:relative;width:100%;height:100%;display:inline-block;'+e.gpu);
			createCSSClass(this.tagname+' h3', 'display:none');

			css.push({k:'h3', v:'display:none;'});
			css.push({k:'.wrap', v:'position:relative;'});
			css.push({k:'svg', v:'font-family:"Helvetica Neue Thin","Helvetica Neue",Helvetica,san-serif;font-size:12px;cursor:auto;'});
			css.push({k:'svg .labels text', v:'color:#787d82;text-anchor:middle;'});
			css.push({k:'svg .labels .type0', v:'text-anchor:end;'});
			css.push({k:'svg .labels .type1', v:'text-anchor:start;'});
			css.push({k:'svg .tracker path', v:'opacity:0;'+e.trackerB});
			css.push({k:'svg .tracker:hover path', v:'opacity:1;'});
			css.push({k:'.export', v:'position:absolute;right:25px;top:15px;width:26px;height:26px;border:1px solid #d6d9da;border-radius:3px;background-size:60%;background-image:url(\'data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScyMCcgaGVpZ2h0PScyMCcgdmlld0JveD0nMCAwIDIwIDIwJz48cGF0aCBmaWxsPScjZDZkOWRhJyBkPSdNMTUgMTVIMlY2aDIuNTk1cy42OS0uODk2IDIuMTctMkgxYy0uNTUzIDAtMSAuNDUtMSAxdjExYzAgLjU1My40NDcgMSAxIDFoMTVjLjU1MyAwIDEtLjQ0NyAxLTF2LTMuNzQ2TDE1IDEzLjlWMTV6bS0xLjY0LTYuOTV2My41NTJMMjAgNi40bC02LjY0LTV2My4xMzJDNS4zIDQuNTMyIDUuMyAxMi41IDUuMyAxMi41YzIuMjgyLTMuNzQ4IDMuNjg2LTQuNDUgOC4wNi00LjQ1eicvPjwvc3ZnPg==\');background-color:rgba(255,255,255,.6);background-position:center;background-repeat:no-repeat;display:block;opacity:0;text-indent:100%;white-space:nowrap;overflow:hidden;visibility:hidden;pointer-events:none;'+e.trackerB});

			css.push({k:'.boards', v:'position:absolute;left:0;top:0;background-color:rgba(255,255,255,.8);padding:6px 20px;border-radius:3px;border:1px solid #dbdbdb;box-shadow:0 2px 3px rgba(0,0,0,.1);z-index:2;display:inline-block;pointer-events:none;z-index:-1;visibility:hidden;opacity:0;'+e.trackerB});
			css.push({k:'.boards h3', v:'font-size:2vmin;font-family:"Helvetica Neue Thin","Helvetica Neue",Helvetica,san-serif;color:#464e56;font-weight:bold;line-height:1.8;display:inline;'});
			css.push({k:'.boards ul', v:'min-width:200px;max-width:300px;'});
			css.push({k:'.boards li', v:'font-size:1.5vmin;width:100%;color:#9d9d9d;line-height:1.8;letter-spacing:-0.31em;*letter-spacing:normal;*word-spacing:-0.43em;text-rendering:optimizespeed;padding:0px;margin:0px;'});
			css.push({k:'.boards li span', v:'width:70%;display:inline-block;word-spacing:normal;letter-spacing:normal;vertical-align:top;zoom:1;*display:inline;text-rendering:auto;'});
			css.push({k:'.boards li span:first-child', v:'font-weight:bold;width:30%;'});
			css.push({k:'.boards.act', v:'visibility:visible;opacity:1;z-index:1;'});

			css.push({k:'.assistant', v:'position:absolute;left:0;top:0;background-color:rgba(255,255,255,.9);padding:0;border-radius:1px;border:1px solid #dbdbdb;box-shadow:0 2px 3px rgba(0,0,0,.1);z-index:-1;display:inline-block;opacity:0;visibility:hidden;'});
			css.push({k:'.assistant a', v:'position:relative;font-size:1.6vmin;line-height:3.5vmin;height:3.5vmin;color:#444;background-position:1em center;background-repeat:no-repeat;background-size:1.1em;padding:0 1em 0 2.4em;display:block;white-space:nowrap;'});
			css.push({k:'.assistant a:after', v:'position:absolute;left:5%;bottom:0;content:\'\';width:90%;height:0;border-top:1px solid #888;'});
			css.push({k:'.assistant li:last-child a:after', v:'display:none;'});
			css.push({k:'.assistant a:hover', v:'background-color:rgba(235,235,235,1);text-decoration:none;'});
			css.push({k:'.assistant .download', v:'background-image:url(\'data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSczMicgaGVpZ2h0PSczMicgdmlld0JveD0nMCAwIDMyIDMyJz48cGF0aCBmaWxsPScjNDQ0JyBkPSdNMTYgMThsOC04aC02VjJoLTR2OEg4em03LjI3My0zLjI3M0wyMS4wMyAxNi45NyAyOS4xNiAyMCAxNiAyNC45MDcgMi44NDQgMjBsOC4xMjctMy4wMy0yLjI0Mi0yLjI0M0wwIDE4djhsMTYgNiAxNi02di04eicvPjwvc3ZnPg==\');'});
			css.push({k:'.assistant .export-csv', v:'background-image:url(\'data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScyMCcgaGVpZ2h0PScyMCcgdmlld0JveD0nMCAwIDIwIDIwJz48cGF0aCBmaWxsPScjNDQ0JyBkPSdNMTUgMTVIMlY2aDIuNTk1cy42OS0uODk2IDIuMTctMkgxYy0uNTUzIDAtMSAuNDUtMSAxdjExYzAgLjU1My40NDcgMSAxIDFoMTVjLjU1MyAwIDEtLjQ0NyAxLTF2LTMuNzQ2TDE1IDEzLjlWMTV6bS0xLjY0LTYuOTV2My41NTJMMjAgNi40bC02LjY0LTV2My4xMzJDNS4zIDQuNTMyIDUuMyAxMi41IDUuMyAxMi41YzIuMjgyLTMuNzQ4IDMuNjg2LTQuNDUgOC4wNi00LjQ1eicvPjwvc3ZnPg==\');display:none;'});
			css.push({k:'.assistant.act', v:'visibility:visible;opacity:1;z-index:1;'});

			if (!this.wc.ShadowDOM) {
				css = css.map(
					function(unit) {
						return {k:e.scope+unit.k, v:unit.v};
					}
				);
				css.push({k:this.tagname+'[export] .export', v:'visibility:visible;pointer-events:auto;'});
				css.push({k:this.tagname+':hover .export', v:'opacity:1;'});
				css.push({k:this.tagname+'[export] .assistant .export-csv', v:'display:block;'});
				css.push({k:this.tagname+'.multi-axisy .export', v:'right:65px;'});
				css.push({k:this.tagname+'.nodata .export', v:'display:none;'});
			} else {
				css.push({k:':host([export]) .export', v:'visibility:visible;pointer-events:auto;'});
				css.push({k:':host(:hover) .export', v:'opacity:1;'});
				css.push({k:':host([export]) .assistant .export-csv', v:'display:block;'});
				css.push({k:':host(.multi-axisy) .export', v:'right:65px;'});
				css.push({k:':host(.nodata) .export', v:'display:none;'});
			}//end if

			//template
			e.buffer = mk();
			lineCharts.prototype.template = e.buffer;
			e.wrap = mk('wrap');
			e.buffer.appendChild(e.wrap);
			e.svg = this.genUnit('svg',
				{
					version: '1.1',
					preserveAspectRatio: 'none',
					viewBox: '0 0 1600 1000',
					xmlns: 'http://www.w3.org/2000/svg'
				}
			);
			e.wrap.appendChild(e.svg);
			e.defs = this.genUnit('defs');
			e.svg.appendChild(e.defs);
			e.svg.appendChild(this.genUnit('g', {class:'grids'}));
			e.svg.appendChild(this.genUnit('g', {class:'labels'}));
			e.svg.appendChild(this.genUnit('g', {class:'lines'}));
			e.svg.appendChild(this.genUnit('g', {class:'trackers'}));
			e.clipPath = this.genUnit('clipPath');
			e.defs.appendChild(e.clipPath);
			e.rect = this.genUnit('rect',
				{
					x: 0,
					y: 0
				}
			);
			e.clipPath.appendChild(e.rect);

			e.boards = mk('boards');
			e.buffer.appendChild(e.boards);
			e.h3 = mk('', {tag:'h3'});
			e.boards.appendChild(e.h3);
			e.ul = mk('', {tag:'ul'});
			e.boards.appendChild(e.ul);

			if (this.download) {
				e.export = mk('export', {tag:'a'});
				e.export.href = '#export';
				e.export.download = 'my_line_chart_data.csv';
				e.export.textContent = 'Export';
				e.export.title = 'export line chart data';
				e.buffer.appendChild(e.export);

				if (this.URLObj && isEventSupported('contextmenu') && typeof XMLSerializer != 'undefined') {
					e.assistant = mk('assistant', {tag:'ul'});
					e.buffer.appendChild(e.assistant);
					window.addEventListener('scroll', this.scroll, false);
				}//end if
			}//end if

			//evt
			window.addEventListener('resize', this.resize, false);

			if (!this.wc.CustomElements && typeof MutationObserver != 'undefined') {
				lineCharts.prototype.observer = new MutationObserver(
					function(mutations) {
						mutations.forEach(function(mutation) {
							lineCharts.prototype.mutate(mutation);
						});
					}
				);
			}//end if

			//properties
			lineCharts.prototype.properties = {
				set: {
					configurable: false,
					value: lineCharts.prototype.set
				},
				get: {
					configurable: false,
					value: lineCharts.prototype.get
				},
				export: {
					configurable: false,
					get: function() {
						return this.hasAttribute('export');
					},
					set: function(flag) {
						(flag) ? this.setAttribute('export', 'export') : this.removeAttribute('export');
					}
				},
				addCallback: {
					configurable: false,
					value: lineCharts.prototype.addCallback
				},
				removeCallback: {
					configurable: false,
					value: lineCharts.prototype.removeCallback
				},
				refresh: {
					configurable: false,
					value: lineCharts.prototype.refresh
				},
				ticks: {
					configurable: false,
					value: lineCharts.prototype.ticks
				}
			};

			//excute css
			if (this.wc.ShadowDOM) {
				e.cssStr = 'h3,div,ul,li{display:block;margin:0;padding:0;}img{border:0}a{text-decoration:none}a:hover{text-decoration:underline;}ul{list-style:none;}';
				while (css.length) {
					var c = css.shift();
					e.cssStr += c.k + '{' + c.v + '}';
				}//end while
				lineCharts.prototype.cssStr = e.cssStr;
			} else {
				while (css.length) {
					var c = css.shift();
					createCSSClass(c.k, c.v);
				}//end while
			}//end if

			//clear
			css = null;
			for (var i in e) e[i] = null;
			e = null;

			//custom element
			this.activeCustomElement();
		}//end if
		return lineCharts.prototype.isSupport;
	},
	activeCustomElement: function() {
		if (lineCharts.prototype.activeCE) return;
		var b = ['', 'webkit', 'moz', 'o', 'ms'], api = 'registerElement', ce = '', prototype, observer;
		lineCharts.prototype.activeCE = true;
		for (var i=-1,l=b.length;++i<l;) {
			var s = b[i], cApi = api;
			cApi = (s.length) ? api.replace(/^[a-z]{1}/,function($1){return $1.toLocaleUpperCase()}) : api;
			s += cApi;
			if (document[s]) { ce = s; break; }
		}//end for

		if (typeof OlineCharts == 'undefined') OlineCharts = {};
		if (!ce) {
			//attachedCallback
			if (typeof MutationObserver != 'undefined') {
				observer = new MutationObserver(
					function(mutations) {
						mutations.forEach(function(mutation) {
							if (mutation.type != 'childList') return;
							[].slice.call(mutation.addedNodes).forEach(
								function(node) {
									// if (lineCharts.prototype.tagP.test(node.tagName)) lineCharts.prototype.attachedCallback(node);
									if (node.childNodes.length) {
										[].slice.call(node.querySelectorAll(lineCharts.prototype.tagname)).forEach(
											function(target) {
												lineCharts.prototype.attachedCallback(target);
											}
										);
									} else if (lineCharts.prototype.tagP.test(node.tagName)) {
										lineCharts.prototype.attachedCallback(node);
									}//end if
								}
							);
						});
					}
				);
				observer.observe(document.body, {childList:true, subtree:true});
			}//end if

			//none custom element support
			[].slice.call(document.querySelectorAll(lineCharts.prototype.tagname)).forEach(
				function(node) {
					lineCharts.prototype.attachedCallback(node);
				}
			);
		} else {
			prototype = Object.create(HTMLElement.prototype, lineCharts.prototype.properties);
			prototype.attachedCallback = lineCharts.prototype.attachedCallback;
			// prototype.detachedCallback = function() {
			// 	if (typeof this.id == 'undefined') return;
			// 	OlineCharts['lineCharts'+this.mid].terminate();
			// };
			prototype.attributeChangedCallback = lineCharts.prototype.attrChange;
			document[ce](lineCharts.prototype.tagname, {prototype: prototype});
		}//end if
	},
	attachedCallback: function(node) {
		var conf, mid, tmp, target;
		if (typeof node != 'undefined') {
			//none custom element support
			if (typeof node.tagName == 'undefined' || !lineCharts.prototype.tagP.test(node.tagName) || (typeof node.Data != 'undefined' && node.Data.isReady)) return;
			target = node;
		} else {
			target = this;
		}//end if
		if (typeof target.isReady != 'undefined') return;

		mid = 'M' + getRand(1, 10000) + '-' + getRand(1, 10000);
		target.mid = mid;
		conf = {
			wrapper: target,
			axisX: {
				ticks: 5,
				labels: [
					{abbr:'', full:''},
					{abbr:'', full:''},
					{abbr:'', full:''},
					{abbr:'', full:''},
					{abbr:'', full:''}
				]
			},
			axisY: {
				ticks: 4,
				data: []
			}
		};

		//grab data from <var>
		tmp = document.querySelector('var');
		if (tmp && tmp.hasAttribute('data-conf')) {
			try { tmp = JSON.parse(tmp.getAttribute('data-conf')); } catch (err) { tmp = {}; }
			for (var j in tmp) {
				conf[j] = tmp[j];
				tmp[j] = null;
			}//end for
		}//end if

		if (target.hasAttribute('data-conf')) {
			try { tmp = JSON.parse(target.getAttribute('data-conf')); } catch (err) { tmp = {}; }
			for (var j in tmp) {
				conf[j] = tmp[j];
				tmp[j] = null;
			}//end for
			tmp = null;
			target.removeAttribute('data-conf');
		}//end if
		//lineCharts
		OlineCharts['lineCharts'+mid] = new lineCharts(mid, conf);
	},
	attrChange: function(attrName, oldVal, newVal, target) {
		var ins;

		if (['data-set', 'export'].indexOf(attrName) == -1) return;
		ins = getIns(target || this, 'lineCharts');
		if (!ins) return;
		switch (attrName) {
			case 'data-set':
				ins.set(newVal);
				break;
			case 'export':
				//do nothing
				break;
		}//end switch
	},
	mutate: function(mutation) {
		var attrName, oldVal, newVal;
		if (mutation.type != 'attributes') return;

		attrName = mutation.attributeName;
		oldVal = mutation.oldValue;
		newVal = mutation.target.getAttribute(attrName);
		lineCharts.prototype.attrChange(attrName, oldVal, newVal, mutation.target);
	},
	i13n: function(action, label) {
		var data;
		if (typeof gaExt == 'undefined') return;

		data = {
			action: action
		};
		data.label = label || 'none';
		gaExt.doEventBeacon(this.Ens.host, data);
	},
	resize: function(e) {
		for (var i in OlineCharts) OlineCharts[i].refresh();
	},
	scroll: function(e) {
		for (var i in OlineCharts) OlineCharts[i].hideContextmenu();
	},
	refresh: function(redraw) {
		var ins;
		ins = (typeof this.tagName != 'undefined') ? getIns(this, 'lineCharts') : this;
		if (!ins || !ins.Data.isReady) return;
		ins.render(redraw);
	},
	hideContextmenu: function() {
		if (!this.Ens.assistant) return;
		this.Ens.assistant.classList.remove('act');
	},
	set: function(key, value) {
		var ins;
		ins = (typeof this.tagName != 'undefined') ? getIns(this, 'lineCharts') : this;
		if (!ins || !ins.Data[key]) return;
		ins.Data[key] = value;
		ins.render(true);
	},
	get: function(key) {
		var ins, res;
		ins = (typeof this.tagName != 'undefined') ? getIns(this, 'lineCharts') : this;
		if (!ins) return;

		if (ins.Data[key]) res = JSON.parse(JSON.stringify(ins.Data[key]));
		return res;
	},
	ticks: function(type, amount) {
		var ins;
		ins = (typeof this.tagName != 'undefined') ? getIns(this, 'lineCharts') : this;
		if (['x', 'y'].indexOf(type) == -1 || parseInt(amount, 10) != amount || !ins) return;

		ins.Data['axis'+capitalize(type)].ticks = amount;
		ins.render();
	},
	addCallback: function(fn) {
		var ins;
		ins = (typeof this.tagName != 'undefined') ? getIns(this, 'lineCharts') : this;
		if (!ins || typeof fn != 'function' || ins.Ens.callBacks.indexOf(fn) != -1) return;
		ins.Ens.callBacks.push(fn);
	},
	removeCallback: function(fn) {
		var ins;
		ins = (typeof this.tagName != 'undefined') ? getIns(this, 'lineCharts') : this;
		if (!ins || typeof fn != 'function' || ins.Ens.callBacks.indexOf(fn) == -1) return;
		ins.Ens.callBacks.splice(ins.Ens.callBacks.indexOf(fn), 1);
	},
	executeCallBack: function(action, serial, data) {
		var host;
		if (!this.Ens.callBacks.length) return;

		host = this.Ens.host;
		//mouseover, mouseout, mousemove
		this.Ens.callBacks.forEach(
			function(fn) {
				fn(action, serial, data, host);
			}
		);
	},
	genUnit: function(type, attrs) {
		var NS, ele;

		NS = 'http://www.w3.org/2000/svg';
		ele = document.createElementNS(NS, type);
		if (typeof attrs == 'object') {
			Object.keys(attrs).forEach(
				function(key) {
					ele.setAttribute(key, attrs[key]);
				}
			);
		}//end if
		return ele;
	},
	pointer: function(e) {
		var res, docElement, body, pos;
		
		res = {};
		docElement = document.documentElement;

		//pointerX
		body = document.body || { scrollLeft: 0 };
		res.x = e.pageX || (e.clientX + (docElement.scrollLeft || body.scrollLeft) - (docElement.clientLeft || 0));

		//pointerY
		body = document.body || { scrollTop: 0 };
		res.y = e.pageY || (e.clientY + (docElement.scrollTop || body.scrollTop) - (docElement.clientTop || 0));

		pos = getPosition(this.Ens.host);
		res.x -= pos[0];
		res.y -= pos[1];

		return res;
	},
	eActG: function(e) {
		var obj = tNa(e, 'g'), ins;
		ins = getIns(obj.t, 'lineCharts');
		if (ins) ins.eAct(e);
	},
	eAct: function(e) {
		var obj, serial, data, counter;
		obj = tNa(e, 'g');
		serial = obj.t.Data.serial;

		switch (obj.a) {
			case 'contextmenu':
				if (!this.Data.PNG) return;
				
				stopEvents(e);
				this.Ens.boards.classList.remove('act');

				obj.pos = this.pointer(e);
				obj.pos.x -= 2;
				obj.pos.y -= 2;
				createCSSClass('#'+this.Ens.assistant.id, 'left:'+obj.pos.x+'px;top:'+obj.pos.y+'px;', this.Ens.sheet);

				this.Ens.assistant.classList.add('act');
				break;
			case 'mouseover':
				data = [];
				this.Ens.subject.textContent = this.Data.axisX.labels[serial].full;
				this.hideContextmenu();
				counter = -1;
				this.Data.stand.forEach(
					function(lineData) {
						lineData.lines.forEach(
							function(line) {
								var d;

								d = JSON.parse(JSON.stringify(line));
								delete(d.anchors);
								delete(d.trackPoints);
								d.currentPoint = line.points[serial];
								data.push(d);

								counter++;
								this.Ens.boardsList[counter].textContent = (Number.isInteger(d.currentPoint)) ? number_format(d.currentPoint) : d.currentPoint;
							}
						, this);
					}
				, this);
				this.Ens.boards.classList.add('act');
				this.Data.boardsSize = getSize(this.Ens.boards);
				break;
			case 'mouseout':
				this.Ens.boards.classList.remove('act');
				break;
			case 'mousemove':
				obj.pos = this.pointer(e);
				obj.x = obj.pos.x - this.Data.boardsSize[0] - 20;
				obj.y = obj.pos.y - this.Data.boardsSize[1] / 2;
				if (obj.x < 0) obj.x = obj.pos.x + 20;

				createCSSClass('#'+this.Ens.boards.id, 'left:'+obj.x+'px;top:'+obj.y+'px;', this.Ens.sheet);
		}//end switch

		if (obj.a != 'mousemove') this.i13n('lineChartsAct', obj.a);
		this.executeCallBack(obj.a, serial, data);
	},
	drawGrids: function(info) {
		var e;

		e = {};
		empty(this.Ens.grids);
		empty(this.Ens.labels);

		//grid-y
		e.queue = [];
		e.rowSize = this.Data.canvasHeight / (this.Data.axisY.ticks);
		e.x = this.Data.padding[3];
		for (var i=-1,l=this.Data.axisY.ticks;++i<l;) {
			var x, y;
			y = Math.floor(this.Data.padding[0] + i * e.rowSize) + 0.5;
			e.queue.push('M ' + e.x + ' ' + y);
			e.queue.push('h ' + this.Data.canvasWidth);
		}//end for
		this.Ens.grids.appendChild(this.genUnit('path',
			{
				d: e.queue.join(' '),
				'stroke-width': 1,
				'stroke-linecap': 'butt',
				stroke: this.defColor.axisY
			}
		));

		for (var i=-1,l=this.Data.stand.length;++i<l;) {
			e.queue = [];
			e.label = this.Data.stand[i].max / this.Data.axisY.ticks;
			e.max = this.Data.stand[i].max;
			e.enableFloat = this.Data.stand[i].enableFloat;
			for (var j=-1,l2=this.Data.axisY.ticks;++j<l2;) {
				var text, label;
				
				e.y = Math.floor(this.Data.padding[0] + j * e.rowSize) + 0.5;
				if (i != 0) {
					e.x = this.Data.padding[3] + this.Data.canvasWidth;
					e.h = 10;
					e.tx = e.x + 16;
				} else {
					e.x = this.Data.padding[3];
					e.h = -10;
					e.tx = e.x - 16;
				};
				e.queue.push('M ' + e.x + ' ' + e.y);
				e.queue.push('h ' + e.h);

				label = e.max - e.label * j;
				if (!e.enableFloat) {
					label = (!Number.isInteger(label)) ? '' : label;
				} else {
					label = (!Number.isInteger(label)) ? label.toFixed(1) : label;
				}//end if
				text = this.genUnit('text',
					{
						x: e.tx,
						y: e.y + 3,
						fill: this.defColor.label,
						class: 'type' + i
					}
				);
				text.textContent = (Number.isInteger(label)) ? number_format(label) : label;
				this.Ens.labels.appendChild(text);
			}//end for
			this.Ens.labels.appendChild(this.genUnit('path',
				{
					d: e.queue.join(' '),
					'stroke-width': 1,
					'stroke-linecap': 'butt',
					stroke: this.defColor.axisY
				}
			));
		}//end for

		//grids - x
		e.queue = [];
		e.queue.push('M ' + this.Data.padding[3] + ' ' +(this.Data.canvasHeight+this.Data.padding[0]+0.5));
		e.queue.push('h ' + this.Data.canvasWidth);
		this.Ens.grids.appendChild(this.genUnit('path',
			{
				d: e.queue.join(' '),
				'stroke-width': 1,
				'stroke-linecap': 'butt',
				stroke: this.defColor.axisX
			}
		));

		e.displaySerial = [];

		//adjust axisX display label
		e.ticks = this.Data.axisX.ticks;
		e.range = [
			{width:400, ticks:3},
			{width:500, ticks:4},
			{width:600, ticks:5},
			{width:800, ticks:6}
		];
		e.range.some(
			function(unit) {
				var flag;
				flag = this.Data.canvasWidth <= unit.width;
				if (flag) e.ticks = unit.ticks;
				return flag;
			}
		, this);

		e.gap = this.Data.axisX.labels.length / e.ticks;
		e.idx = this.Data.axisX.labels.length - 1;
		for (var i=-1,l=this.Data.axisX.ticks;++i<l;) {
			if (this.Data.axisX.labels[e.idx]) e.displaySerial.push(e.idx);
			e.idx = Math.round(e.idx - e.gap);
		}//end for

		e.queue = [];
		e.queue2 = [];
		e.y = this.Data.canvasHeight + this.Data.padding[0] + 0.5;
		e.y2 = this.Data.padding[0] + 0.5;
		this.Data.axisXPoints.forEach(
			function(x, idx) {
				if (e.displaySerial.indexOf(idx) == -1) return;

				//grid
				e.queue2.push('M ' + x + ' ' + e.y2);
				e.queue2.push('v ' + this.Data.canvasHeight);
				this.Ens.grids.appendChild(this.genUnit('path',
					{
						d: e.queue2.join(' '),
						'stroke-width': 1,
						'stroke-linecap': 'butt',
						stroke: this.defColor.axisY
					}
				));

				e.queue.push('M ' + x + ' ' + e.y);
				e.queue.push('v ' + 10);
				text = this.genUnit('text',
					{
						x: x,
						y: e.y + 22,
						fill: this.defColor.label
					}
				);
				text.textContent = this.Data.axisX.labels[idx].abbr;
				this.Ens.labels.appendChild(text);
			}
		, this);
		this.Ens.labels.appendChild(this.genUnit('path',
			{
				d: e.queue.join(' '),
				'stroke-width': 1,
				'stroke-linecap': 'butt',
				stroke: this.defColor.axisX
			}
		));

		//clear
		for (var i in e) e[i] = null;
		e = null;
	},
	drawTrackers: function() {
		var half, final;
		empty(this.Ens.trackers);
		if (!this.Data.stand.length) return;

		half = this.Data.colSize / 2;
		final = this.Data.axisXPoints.length - 1;
		this.Data.axisXPoints.forEach(
			function(x, idx) {
				var e, nX, w;

				e = {};
				nX = x - ((!idx) ? 0 : half);
				w = (idx != final) ? this.Data.colSize : this.Data.colSize/2;

				e.g = this.genUnit('g', {class:'tracker'});
				this.Ens.trackers.appendChild(e.g);
				e.g.Data = {
					ClassID: this.id,
					serial: idx
				};
				e.g.appendChild(this.genUnit('rect',
					{
						x: nX,
						y: this.Data.padding[0] + 0.5,
						width: w,
						height: this.Data.canvasHeight,
						fill: 'transparent',
						'fill-opacity': 0
					}
				));

				e.queue = [];
				e.queue.push('M ' + x +' ' + (this.Data.padding[0] + 0.5));
				e.queue.push('v', this.Data.canvasHeight);
				e.g.appendChild(this.genUnit('path',
					{
						d: e.queue.join(' '),
						'stroke-width': 1,
						'stroke-linecap': 'butt',
						'stroke-dasharray': '8,4',
						stroke: this.defColor.tracker
					}
				));

				//points
				this.Data.stand.forEach(
					function(lineData) {
						lineData.lines.forEach(
							function(line) {
								var color, y;
								color = line.color;
								y = line.trackPoints[idx];

								e.queue = [];
								e.queue.push('M ' + (x-6) + ' ' + y);
								e.queue.push('A 6 6, 0, 0, 0, '+ (x+6) + ' ' + y);
								e.queue.push('A 6 6, 0, 0, 0, '+ (x-6) + ' ' + y);
								e.g.appendChild(this.genUnit('path',
									{
										d: e.queue.join(' '),
										stroke: 'none',
										fill: color,
										'fill-opacity': .3
									}
								));

								e.queue = [];
								e.queue.push('M ' + (x-3) + ' ' + y);
								e.queue.push('A 3 3, 0, 0, 0, '+ (x+3) + ' ' + y);
								e.queue.push('A 3 3, 0, 0, 0, '+ (x-3) + ' ' + y);
								e.g.appendChild(this.genUnit('path',
									{
										d: e.queue.join(' '),
										'stroke-width': 1,
										fill: '#fff',
										stroke: color
									}
								));
							}
						, this);
					}
				, this);

				//clear
				for (var i in e) e[i] = null;
				e = null;
			}
		, this);
	},
	drawLines: function() {
		empty(this.Ens.lines);
		if (!this.Data.stand.length) return;

		for (var i=-1,l=this.Data.stand.length;++i<l;) {
			var lineData, max;
			lineData = this.Data.stand[i];
			max = lineData.max;

			//trackPoints
			lineData.lines.forEach(
				function(line, idx) {
					var x, o, canvasHeight;
					x = this.Data.axisXPoints[idx];
					o = this.Data.canvasHeight + this.Data.padding[0];
					canvasHeight = this.Data.canvasHeight;

					line.trackPoints = [];
					line.anchors.forEach(
						function(point, s) {
							var y;
							y = o - point / max * canvasHeight;
							line.trackPoints.push(y);
						}
					, this);
				}
			, this);

			lineData.lines.forEach(
				function(line, idx) {
					var color, queue, d, tmp, o, nOpacity, strokeWidth;
					color = line.color || this.colorStamp[idx];
					o = this.Data.canvasHeight + this.Data.padding[0];
					queue = [];

					line.trackPoints.forEach(
						function(point, s) {
							var act;
							act = (!s) ? 'M' : 'L';
							queue.push(act + ' '+ this.Data.axisXPoints[s] + ' ' + point);
						}
					, this);
					d = queue.join(' ');

					if (lineData.isStackedAreaChart) {
						tmp = line.anchors.length;
						if (typeof lineData.lines[idx+1] != 'undefined') {
							lineData.lines[idx+1].trackPoints.slice(0).reverse().forEach(
								function(point, s) {
									var serial;
									serial = tmp - s - 1;
									queue.push('L '+ this.Data.axisXPoints[serial] + ' ' + point);
								}
							, this);
						} else {
							for (var i=-1,l=tmp;++i<l;) {
								var serial;
								serial = tmp - i - 1;
								queue.push('L '+ this.Data.axisXPoints[serial] + ' ' + o);
							}//end for
						}//end if
						queue.push('Z');
						//area chart
						this.Ens.lines.appendChild(this.genUnit('path',
							{
								d: queue.join(' '),
								stroke: 'none',
								fill: color,
								'fill-opacity': line.opacity || .8
							}
						));
						color = '#fff';
						nOpacity = 1;
						strokeWidth = 1.25;
					} else {
						nOpacity = line.opacity || 1;
						strokeWidth = 3;
					}//end if

					//line
					this.Ens.lines.appendChild(this.genUnit('path',
						{
							d: d,
							'stroke-width': strokeWidth,
							'stroke-linecap': 'round',
							'stroke-linejoin': 'round',
							stroke: color,
							'stroke-opacity': nOpacity,
							fill: 'none'
						}
					));
				}
			, this);
		}//end for
	},
	genCSV: function() {
		var csv, content, column, arr;

		if (!this.Data.stand.length) return;

		csv = [];
		content = '';
		column = [];

		//subject
		this.Data.axisY.data.forEach(
			function(lineData) {
				lineData.lines.forEach(
					function(line) {
						column.push(line.title);
					}
				, this);
			}
		, this);
		column.unshift('');
		
		this.Data.axisX.labels.forEach(
			function(label, idx) {
				var row;
				row = [];
				row.push(label.full);

				this.Data.axisY.data.forEach(
					function(lineData) {
						lineData.lines.forEach(
							function(line) {
								row.push(line.points[idx]);
							}
						, this);
					}
				, this);
				csv.push(row);
			}
		, this);
		csv.reverse();
		csv.unshift(column);
		this.Data.CSV = csv;

		//convert
		if (this.Ens.export || (this.Ens.menu && this.Ens.menu['export-csv'])) {
			//detect OS
			if (navigator.appVersion && /macintosh/i.test(navigator.appVersion)) {
				csv.forEach(
					function(data, idx) {
						content += data.map(function(unit){return unit.toString().replace(/,/g, ' ');}).join("\t") + "\r\n";
					}
				);
				content = '\ufffe' + content;
				arr = [];
				for (var i=-1,l=content.length;++i<l;) arr.push(content.charCodeAt(i));
				content = new Uint16Array(array);
				content = new Blob([content] , {type: 'text/csv;charset=utf-16;'});
				content = this.URLObj.createObjectURL(content);
			} else {
				csv.forEach(
					function(data, idx) {
						content += data.map(function(unit){return unit.toString().replace(/,/g, ' ');}).join() + "\n";
					}
				);
				content = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURI(content);
			}//end if
			if (this.Ens.export) this.Ens.export.href = content;
			if (this.Ens.menu && this.Ens.menu['export-csv']) this.Ens.menu['export-csv'].href = content;
		}//end if
	},
	doAnimate: function() {
		var c, rect, max, ins;

		clearInterval(this.Data.iid);
		c = 0;
		rect = this.Ens.rect;
		max = this.Data.canvasWidth;
		ins = this;

		this.Data.iid = setInterval(
			function() {
				rect.setAttribute('width', c);
				if (c >= max) clearInterval(ins.Data.iid);
				c += 20;
			}
		, 10);
	},
	genSaveAs: function() {
		var img, svg, svgString, m, url;

		if (!this.Ens.menu || !this.Ens.menu.download || !this.URLObj || typeof XMLSerializer == 'undefined') return;

		this.Data.PNG = false;
		svg = this.Ens.svg.cloneNode(true);
		svg.querySelector('defs rect').setAttribute('width', this.Data.canvasWidth);
		svg.querySelector('.trackers').remove();
		svg.querySelector('.grids').insertBefore(
			this.genUnit('rect',
				{
					width: this.Data.size[0],
					height: this.Data.size[1],
					fill: '#fff'
				}
			)
		, svg.querySelector('.grids').firstChild);

		svgString = new XMLSerializer().serializeToString(svg);
		svg = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});

		m = this;
		url = this.URLObj.createObjectURL(svg);
		img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = img.onerror = function(evt) {
		    var canvas, image;

		    if (/error/i.test(evt.type)) return;

		    m.Data.PNG = true;
		    canvas = document.createElement('canvas');
			canvas.width = m.Ens.svg.getAttribute('width');
			canvas.height = m.Ens.svg.getAttribute('height');
		    canvas.getContext('2d').drawImage(img, 0, 0);
		    
		    m.Ens.menu.download.href = canvas.toDataURL('image/png');
		    m.URLObj.revokeObjectURL(url);
		};
		img.src = url;
	},
	render: function(animate) {
		var listData;
		
		this.hideContextmenu();
		this.Data.PNG = false;
		this.Data.size = getSize(this.Ens.host);
		// if (this.Data.size.some(s => s <= 0)) return;
		if (this.Data.size.some(function(s){return s <= 0;})) return;

		this.Data.CSV = [];
		if (this.Data.axisY.data.length > 1) {
			this.Ens.host.classList.add('multi-axisy');
			this.Data.padding[1] = 60;
		} else {
			this.Ens.host.classList.remove('multi-axisy');
			this.Data.padding[1] = 20;
		}//end if
		this.Data.canvasWidth = this.Data.size[0] - this.Data.padding[3] - this.Data.padding[1];
		this.Data.canvasHeight = this.Data.size[1] - this.Data.padding[0] - this.Data.padding[2];
		this.Data.viewBox = [0, 0].concat(this.Data.size);
		if (this.Data.axisX.ticks == 'undefined' || this.Data.axisX.ticks > this.Data.axisX.labels.length)  this.Data.axisX.ticks = this.Data.axisX.labels.length;

		this.Data.axisXPoints = [];
		this.Data.colSize = this.Data.canvasWidth / (this.Data.axisX.labels.length - 1);
		this.Data.axisX.labels.forEach(
			function(key, idx) {
				this.Data.axisXPoints.push(Math.floor(this.Data.padding[3] + idx * this.Data.colSize) + 0.5);
			}
		, this);

		//line data
		this.Data.axisY.data = this.Data.axisY.data.slice(0, 2);
		this.Data.axisY.data.forEach(
			function(lineData) {
				lineData.lines.forEach(
					function(line, idx) {
						line.points = line.points.map(function(point){return Number(point);});
					}
				);
			}
		, this);

		listData = [];
		this.Data.stand = JSON.parse(JSON.stringify(this.Data.axisY.data));
		this.Data.stand.forEach(
			function(lineData) {
				var range, max, tmp, summary;
				range = [];
				tmp = 1;

				if (lineData.isStackedAreaChart) {
					// if (lineData.lines.length > 1) {
					// 	//prepare total
					// 	summary = {
					// 		id: 'summary',
					// 		title: 'Summary',
					// 		points: [],
					// 		color: this.defColor.summary,
					// 		opacity: .8
					// 	};
					// 	lineData.lines.forEach(
					// 		function(line) {
					// 			line.points.forEach(
					// 				function(point, idx) {
					// 					if (typeof summary.points[idx] == 'undefined') summary.points[idx] = 0;
					// 					summary.points[idx] += point;
					// 				}
					// 			);
					// 		}
					// 	);
					// 	lineData.lines.push(summary);
					// }//end if

					lineData.lines.forEach(
						function(line, idx) {
							var clone;
							line.anchors = line.points.slice(0);
							if (!idx) return;
							
							clone = lineData.lines[idx-1].anchors;
							line.anchors = line.anchors.map(
								function(value, order) {
									return value + clone[order];
								}
							);
						}
					, this);
					lineData.lines.reverse();
				} else {
					lineData.lines.forEach(
						function(line) {
							line.anchors = line.points.slice(0);
						}
					);
				}//end if

				//get max
				for (var i=-1,l=lineData.lines.length;++i<l;) {
					range = range.concat(lineData.lines[i].anchors);
					listData.push(
						{
							color: lineData.lines[i].color,
							title: lineData.lines[i].title
						}
					);
				}//end for
				lineData.range = range.sort(function(a, b) { return b - a; });
				lineData.max = lineData.range[0] || 9000;
				if (!Number.isInteger(lineData.max)) lineData.max = Math.ceil(lineData.max);

				for (var i=-1,l=lineData.max.toString().length-1;++i<l;) tmp *= 10;
				lineData.max += tmp - lineData.max % tmp;
			}
		, this);
		this.Ens.host.classList[(!listData.length) ? 'add' : 'remove']('nodata');

		//boards
		empty(this.Ens.boardsLists);
		this.Ens.boardsList = [];
		listData.forEach(
			function(list, idx) {
				var li, data, title, key;

				key = idx + 1;
				li = mk('', {tag:'li'});
				this.Ens.boardsLists.appendChild(li);
				data = mk('', {tag:'span'});
				li.appendChild(data);
				title =  mk('', {tag:'span'});
				li.appendChild(title);
				title.textContent = list.title;

				if (this.Ens.sheet) {
					createCSSClass('.boards li:nth-child(' + key + ') span:first-child', 'color:'+list.color+';', this.Ens.sheet);
				} else {
					createCSSClass('#'+this.Ens.host.id+' .boards li:nth-child(' + key + ') span:first-child', 'color:'+list.color+';');
				}//end if
				this.Ens.boardsList.push(data);
			}
		, this);

		//export
		this.genCSV();

		//clipPath
		this.Ens.rect.setAttribute('x', this.Data.padding[3]);
		this.Ens.rect.setAttribute('y', this.Data.padding[0]);
		this.Ens.rect.setAttribute('width', this.Data.canvasWidth);
		this.Ens.rect.setAttribute('height', this.Data.canvasHeight);

		//canvas
		this.Ens.svg.setAttribute('viewBox', this.Data.viewBox.join(' '));
		this.Ens.svg.setAttribute('width', this.Data.size[0]);
		this.Ens.svg.setAttribute('height', this.Data.size[1]);

		//grids
		this.drawGrids();

		//lines
		if (animate && this.Data.stand.length) {
			this.Ens.rect.setAttribute('width', 0);
			this.drawLines();
			this.doAnimate();
		} else {
			this.drawLines();
		}//end if

		//trackers
		this.drawTrackers();

		//saveAs
		this.genSaveAs();
	},
	terminate: function() {
		var mid = this.id;

		//events
		// this.Ens.trigger.stopObserving();
		// this.Ens.overlay.stopObserving();

		setTimeout(function(){
			var c = OlineCharts['lineCharts'+mid];
			purge(c.Data);
			for (var i in c.Ens) c.Ens[i] = null;
			c.id = c.Data = c.Ens = null;
			try { delete(OlineCharts['lineCharts'+mid]); } catch(e) {}
		}, 100);
	}
};

/*auto-registration*/
(function() {
	var dependencies, c = 0, max = 10000;//10 seconds
	if (typeof navigator.oRegists == 'undefined') navigator.oRegists = {};
	dependencies = lineCharts.prototype.dependencies;
	navigator.oRegists.lineCharts = setInterval(
		function() {
			var isReady = true;
			c += 5;
			if (c >= max) {
				clearInterval(navigator.oRegists.lineCharts);
				return;
			}//end if
			for (var i=-1,l=dependencies.length;++i<l;) {
				var root = window, d = dependencies[i].split('.');
				while (d.length) {
					var prop = d.shift();
					if (!root[prop]) {
						root = null;
						break;
					} else root = root[prop];
				}//end while
				isReady &= (root != null);
			}//end for
			if (isReady && document.body) {
				clearInterval(navigator.oRegists.lineCharts);
				navigator.oRegists.lineCharts = null;
				lineCharts.prototype.determine();
			}//end if
		}
	, 5);
})();
/*programed by mei(李維翰), http://www.facebook.com/mei.studio.li*/