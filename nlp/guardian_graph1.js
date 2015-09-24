
// For MSIE < 9, forget it
function D3notok() {
  document.getElementById('sidepanel').style.visibility = 'hidden';
  var nocontent = document.getElementById('nocontent');
  nocontent.style.visibility = 'visible';
  nocontent.style.pointerEvents = 'all';
  var t = document.getElementsByTagName('body');
  var body = document.getElementsByTagName('body')[0];
  body.style.backgroundImage = "url('movie-network-screenshot-d.png')";
  body.style.backgroundRepeat = "no-repeat";
}

function D3ok() {
    var width = 960,
        height = 500;
    
    var color = d3.scale.category20();

    var force = d3.layout.force()
	.linkDistance(10)
	.linkStrength(2)
	.size([width, height]);

    var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);
    
    d3.json("./all_nodeslinks.json", function(error, graph) {
	if (error) throw error;
	
	var nodes = graph.nodes.slice(),
	    links = [],
	    bilinks = [];
	
	//var s = 0
	//var t = 0
	graph.links.forEach(function(d) {
	    if (typeof d.source == "number" && typeof d.target == "number") {

		var s = nodes[d.source];
		var t = nodes[d.target];
		var i = {}; // intermediate node
		nodes.push(i);
		links.push({source: s, target: i, value: 1}, 
			   {source: i, target: t, value: 1});
		//links.push({source: s, target: t});
		bilinks.push([s, i, t]);
		
		//d.source = nodes[d.source]; }
	    //if () { d.target = nodes[d.target]; 
	    }
	    
	});

	console.log(nodes)
	console.log(links)

	force
	    .nodes(nodes)
	    .links(links)
	    .start();
	//force.linkDistance(15);

	var link = svg.selectAll(".link")
	    .data(bilinks)
	    .enter().append("path")
	    .attr("class", "link");
	
	var node = svg.selectAll(".node")
	    .data(graph.nodes)
	    .enter().append("circle")
	    .attr("class", "node")
	    .attr("r", 5)
	    .style("fill", function(d) { return color(d.topic); })
	    .call(force.drag);
	
	node.append("title")
	    .text(function(d) { return d.author; });
	
	force.on("tick", function() {
	    link.attr("d", function(d) {
		return "M" + d[0].x + "," + d[0].y
		    + "S" + d[1].x + "," + d[1].y
		    + " " + d[2].x + "," + d[2].y;
	    });
	    node.attr("transform", function(d) {
		return "translate(" + d.x + "," + d.y + ")";
	    });
	});
    });
}
