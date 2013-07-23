var dataset = [ 5, 10, 13, 19, 21, 25, 22, 18, 15, 13, 11, 12, 15, 20, 18, 17, 16, 18, 23, 25, 20, 5, 10, 13 ];
var dataparit = [];

for (var i = dataset.length - 1; i >= 0; i--) {
  dataparit[i] = {tunti: i, maara: dataset[i]};
};

var svg = d3.select("td").append("svg");
var w = 600;
var h = 200;
var ch = 50;
var barWidth = 20;
var barPadding = 3;
var padding = 20;
var transitionSpeed = 50;
var mouseDown = false;
var mouseReleased = true;
var selected = -1;
var arrowHeight = 15;
var key = function(d) {
	return d.tunti;
}
var mouseLeft = false;
var integerFormat = d3.format("d");
var nollapalkinKoko = 2;
var maksimiMaara = 50;

var yScale = d3.scale.linear()
	.domain([0, d3.max(dataparit, function(d) { return d.maara; }) * 1.1 + 1])
	.range([h - padding - nollapalkinKoko, padding]);

var xScale = d3.scale.ordinal()
	.domain(d3.range(dataparit.length))
	.rangeRoundBands([padding, w], 0.1);

svg.attr("width", w).attr("height", h + ch);

var canvas = svg.append("rect")
	.attr({
		x: padding,
		y: padding,
		height: h - 2 * padding,
		width: w
	})
	.style({
		fill: "#f5fffa"
	})

var bars = svg.selectAll(".palkki")
    .data(dataparit, key)
    .enter()
    .append("rect")
    .attr("id", function(d, i){
    	return "bar_" + d.tunti;
    })
    .attr("class", "palkki")
    .style({
    		"fill": "teal",
  			"stroke": "black",
  			"stroke-width": 1,
    });

bars.attr("x", function(d,i){
	return xScale(d.tunti);
	});
bars.attr("y", function(d) {
	return yScale(d.maara);
});

bars.attr("width", xScale.rangeBand() );
bars.attr("height", function(d,i){
		return h - yScale(d.maara) - padding;
	});

var xAxis = d3.svg.axis()
	.scale(xScale)
	.orient("bottom")
	.ticks(20)
	.tickFormat(integerFormat);

var yAxis = d3.svg.axis()
	.scale(yScale)
	.orient("left")
	.ticks(5)
	.tickFormat(integerFormat);


svg.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + (h - padding) + ")")
	.call(xAxis);

svg.append("g")
	.attr("class", "y axis")
	.attr("transform", "translate(" + padding + ",0)")
	.call(yAxis);

// Kontrollien osio:

svg.on("mousemove", function(){
	if (mouseDown && selected != -1)
	{
		var arvo = Math.round(yScale.invert(d3.mouse(this)[1]));
			if (arvo >= 0)
			{
				dataparit[selected].maara = Math.min(maksimiMaara, arvo);
				paivitaNakyma(arvo, selected);
			}
	}
	})
	.on("mouseup", function(){
		if (selected != -1 && mouseLeft)
		{
			d3.selectAll("#tooltip_" + selected)
				.transition()
				.duration(transitionSpeed)
				.remove();

			d3.select("#bar_" + selected)
				.transition()
				.duration(transitionSpeed)
				.style("fill", "teal");
		}
		selected = -1;
		mouseDown = false;
		mouseReleased = true;
		mouseLeft = false;
	})
	.on("mouseleave", function(){
		if (selected != -1)
		{
			d3.selectAll("#tooltip_" + selected)
				.transition()
				.duration(transitionSpeed)
				.remove();

			d3.select("#bar_" + selected)
				.transition()
				.duration(transitionSpeed)
				.style("fill", "teal");
		}
		selected = -1;
		mouseDown = false;
		mouseReleased = true;
		mouseLeft = false;
	});


svg.selectAll(".nappi")
	.data(dataparit, key)
	.enter()
	.append("g")
	.attr("class", "nappi")
	.on("mouseover", function(d, i){
		if (selected == -1){
			teeLabel(d.maara, d.tunti);
			svg.select("#bar_" + d.tunti)
				.transition()
				.duration(transitionSpeed)
			 	.style("fill", "#80C9BC");

			svg.select()
		}
		else if (mouseLeft && selected == d.tunti)
		{
			mouseLeft = false;
		}
	})
	.on("mouseleave", function(d, i){
		if (!mouseDown)
		{
			d3.selectAll("#tooltip_" + d.tunti)
				.transition()
				.duration(transitionSpeed)
				.remove();

			d3.select("#bar_" + d.tunti)
				.transition()
				.duration(transitionSpeed)
				.style("fill", "teal");
		}
		else
		{
			mouseLeft = true;
		}
	})
	.on("mousedown", function(d, i){
		event.preventDefault();
		mouseDown = true;
		selected = d.tunti;

		var arvo = Math.round(yScale.invert(d3.mouse(this)[1]));
			if (arvo >= 0)
			{
				dataparit[d.tunti].maara = Math.min(maksimiMaara, arvo);
				paivitaNakyma(arvo, d.tunti);
			}
	})
	.append("rect")
	.attr({
		x: function(d, i) {return xScale(d.tunti)},
		y: 0,
		width: xScale.rangeBand(),
		height: h + ch,
		fill: "none",
		"pointer-events": "all"
	});

svg.selectAll(".nappi")
	.append("g")
	.attr("class", "plusG")
	.append("polygon")
	.attr("class", "kolmio")
	.attr("points", function(d, i){
		var x1 = xScale(d.tunti) + xScale.rangeBand() / 2;
		var y1 = h + ch / 2 - arrowHeight;
		var x2 = xScale(d.tunti) + xScale.rangeBand();
		var y2 = h + (ch / 2) - 1;
		var x3 = xScale(d.tunti);
		var y3 = h + (ch / 2) - 1;

		return x1 + "," + y1 + " " + x2 + "," + y2 + " " + x3 + "," + y3; 
	})
	.style("fill", "#7CC466");

svg.selectAll(".nappi")
	.append("text")
	.text("+")
	.attr("y", h + (ch / 2) - arrowHeight / 2 + 5)
	.attr("x", function(d, i) {
		return xScale(d.tunti) + xScale.rangeBand() / 2;
	})
	.style("text-anchor", "middle")
	.attr("id", function(d, i) {
		return d.tunti;
	})
	.attr("class", "plus")
	.style("font-weight", "bold")
	.style("font-size", "10px");

svg.selectAll(".nappi")
	.append("g")
	.attr("class", "miinusG")
	.append("polygon")
	.attr("class", "kolmio")
	.attr("points", function(d, i){
		var x1 = xScale(d.tunti) + xScale.rangeBand() / 2;
		var y1 = h + (ch / 2) + arrowHeight;
		var x2 = xScale(d.tunti) + xScale.rangeBand();
		var y2 = h + (ch / 2) + 1;
		var x3 = xScale(d.tunti);
		var y3 = h + (ch / 2) + 1;

		return x1 + "," + y1 + " " + x2 + "," + y2 + " " + x3 + "," + y3; 
	})
	.style("fill", "#E66161");

svg.selectAll(".miinusG")
	.append("text")
	.text("-")
	.attr("y", h + (ch / 2) + arrowHeight / 2)
	.attr("x", function(d, i) {
		return xScale(d.tunti) + xScale.rangeBand() / 2;
	})
	.style("text-anchor", "middle")
	.attr("id", function(d, i) {
		return d.tunti;
	})
	.attr("class", "miinus")
	.style("font-weight", "bold");

svg.selectAll(".plus")
	.on("click", function(d, i) {
		dataparit[d.tunti].maara += 1;
		paivitaNakyma(d.maara + 1, i);
	});

svg.selectAll(".miinus")
	.on("click", function(d, i) {
		dataparit[d.tunti].maara -= 1;
		paivitaNakyma(d.maara - 1, i);
	});

function paivitaNakyma(da, ind){

	da = Math.min(da, maksimiMaara);
	yScale.domain([0, d3.max(dataparit, function(d) { return d.maara }) * 1.1 + 1]);

	svg.selectAll(".palkki")
		.data(dataparit, key);

	bars.transition()
		.duration(transitionSpeed)
		.attr("y", function(d) {
			return yScale(d.maara);
		})
		.attr("height", function(d,i){
			return h - yScale(d.maara) - padding;
		});

	svg.select(".y.axis")
		.transition()
		.duration(transitionSpeed)
		.call(yAxis);

	svg.selectAll(".nappi")
		.data(dataparit, key);

	svg.selectAll(".plus")
		.data(dataparit, key);

	svg.selectAll(".miinus")
		.data(dataparit, key);

	svg.selectAll("#tooltip_" + ind)
		.transition()
		.duration(transitionSpeed)
		.text(da)
		.attr("y", function(){
			var palautettava = yScale(da) + 14;
			if (palautettava > h - 2 * padding){
				palautettava = yScale(da) - 14;
			}

			return palautettava;
		});

}

function teeLabel(d, i){
	d = Math.min(d, maksimiMaara);
	var xPos = xScale(i) + xScale.rangeBand() / 2;
	var yPos = yScale(d) + 14;

	if (yPos > h - 2 * padding){
		yPos = yScale(d) - 14;
	}

	svg.append("text")
		.attr("id", "tooltip_" + i)
		.attr("class", "label")
		.transition()
		.duration(transitionSpeed)
	  .attr("x", xPos)
	  .attr("y", yPos)
	  .attr("col", i)
	  .text(d);
}
