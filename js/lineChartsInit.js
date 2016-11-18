var init;
init = {
	data: {},
	graphicData: {},
	ens: {},
	eAct: function(e) {
		var obj, value;
		
		obj = tNa(e);
		value = obj.t.value;

		//lineCharts
		init.ens.lineCharts.set('axisY', init.data[value]);

		init.ens.li.forEach(
			function(li) {
				empty(li);
			}
		);

		switch (value) {
			case 'type0':
				init.ens.li[0].appendChild(mk('mei-b type0 line', {tag:'p', att:{textContent:'iPhone 7'}}));
				init.ens.li[0].appendChild(mk('mei-b type1 line', {tag:'p', att:{textContent:'iPhone 6'}}));
				break;
			case 'type1':
				init.ens.li[0].appendChild(mk('mei-b type0 line', {tag:'p', att:{textContent:'iPhone 7'}}));
				init.ens.li[0].appendChild(mk('mei-b type1 line', {tag:'p', att:{textContent:'iPhone 6'}}));
				init.ens.li[1].appendChild(mk('mei-b type2 line', {tag:'p', att:{textContent:'iPad'}}));
				break;
			case 'type2':
				// init.ens.li[0].appendChild(mk('mei-b type3', {tag:'p', att:{textContent:'Summary'}}));
				init.ens.li[0].appendChild(mk('mei-b type0', {tag:'p', att:{textContent:'iPhone 7'}}));
				init.ens.li[0].appendChild(mk('mei-b type1', {tag:'p', att:{textContent:'iPhone 6'}}));
				break;
			case 'type3':
				// init.ens.li[0].appendChild(mk('mei-b type3', {tag:'p', att:{textContent:'Summary'}}));
				init.ens.li[0].appendChild(mk('mei-b type0', {tag:'p', att:{textContent:'iPhone 7'}}));
				init.ens.li[0].appendChild(mk('mei-b type1', {tag:'p', att:{textContent:'iPhone 6'}}));
				init.ens.li[1].appendChild(mk('mei-b type2 line', {tag:'p', att:{textContent:'iPad'}}));
				break;
		}//end switch
	},
	ready: function() {
		var data, dummy;

		dummy = {
			enableFloat: false,
			isStackedAreaChart: false,
			lines: [
				{
					id: 'model2',
					title: 'iPad',
					points: ["52943", "54771", "54426", "55772", "54943", "55635", "56602", "55608", "56920", "57863", "57031", "60693", "61032", "58808", "59649", "59411", "55402", "56402", "58139", "57851", "59745", "58216", "57792", "55599", "55813", "54909", "56182", "59277", "57209", "53622"],
					color: '#46c9ae',
					opacity: 1
				}
			]
		};
		
		this.ens.select = document.querySelector('select');
		this.ens.lineCharts = document.querySelector('line-charts');
		this.ens.li = [].slice.call(document.querySelectorAll('.info li'));

		data = this.ens.lineCharts.get('axisY');
		for (var i=-1,l=4;++i<l;) this.data['type'+i] = JSON.parse(JSON.stringify(data))

		this.data.axisX = this.ens.lineCharts.get('axisX');
		this.data.type1.data.push(dummy);
		this.data.type2.data[0].isStackedAreaChart = true;
		this.data.type2.data.forEach(
			function(lineData) {
				lineData.lines.forEach(
					function(line) {
						line.opacity = .8;
					}
				);
			}
		);
		this.data.type3.data[0].isStackedAreaChart = true;
		this.data.type3.data.forEach(
			function(lineData) {
				lineData.lines.forEach(
					function(line) {
						line.opacity = .8;
					}
				);
			}
		);
		this.data.type3.data.push(dummy);

		//info
		this.ens.li[0].appendChild(mk('mei-b type0 line', {tag:'p', att:{textContent:'iPhone 7'}}));
		this.ens.li[0].appendChild(mk('mei-b type1 line', {tag:'p', att:{textContent:'iPhone 6'}}));

		//start
		this.ens.select.disabled = false;
		this.ens.select.addEventListener('change', this.eAct, false);
	}
};

function pageInit() {
	var lineCharts, c, max, iid;

	lineCharts = document.querySelector('line-charts');
	c = 0;
	max = 10000;
	iid = setInterval(
		function() {
			c += 5;
			if (c >= max) {
				clearInterval(iid);
				return;
			}//end if
			if (typeof lineCharts.get != 'undefined' && lineCharts.get('isReady')) {
				clearInterval(iid);
				init.ready();
			}//end if
		}
	, 5);
}
/*programed by mei(李維翰), http://www.facebook.com/mei.studio.li*/