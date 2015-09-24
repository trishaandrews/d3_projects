
function Graph_authors(topic) {
    var width = 650,
        height = 500;
    
    var color = d3.scale.category20();
    var cgdist = 200;
    var cg = -150;
    var allcgdist = 200;
    var allcg = -50;
    var force = d3.layout.force()
	.charge(cg)
	.linkDistance(20)
	.linkStrength(1)
	.size([width, height])
	.chargeDistance(cgdist);

    var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);
    
    var scale = "sqrt"

    var colorby = "";
    if (topic == "all"){
	colorby = "topic";
    }else{
	colorby = "author";
    }
    var link, node, textlegend;
    var url = "./" + topic +"_nodeslinks.json"
    update_graph(url, colorby, scale);

    //==========================================
    // Text legend
    var tloffset = 30; 
    var tlx = 10;
    var textlegend = svg.append("g")
	.attr("class", "textlegend")
	.attr("transform", "translate(0, "+ tloffset +")")
    
    textlegend.append("text")
	.attr("class", "textlegendElement")
	.attr("id", "topictext")
	//.text("Topic: " + topic)
	
    
    textlegend.append("text")
	.attr("class", "textlegendElement")
	.attr("id", "colortext")
	//.text("Color by: " + colorby)
	
    
    
    
    // read a change in topic radio button
    $("input[name=topic]:radio").change(function () {
	//console.log(this.value)
	topic = this.value
	url = "./" + topic +"_nodeslinks.json"
	if (topic == "all"){
	    colorby = "topic";
	}else{
	    colorby = "author";
	}
	update_graph(url, colorby, scale);
    });

    // read a change in scale radio button
    $("input[name=scale]:radio").change(function () {
	//console.log(this.value)
	scale = this.value
	updateScale(scale);
    });
    
    
    //=========================================
    function updateScale (newscale){
	var t = svg.transition().duration(100);
	//svg.selectAll(".node")
	//.data(graph.nodes)
	//.enter().append("circle")
	//.attr("class", "node")
	if (newscale == "linear"){
	    node.attr("r", function(d) {return d.count;})
	}else if(newscale == "sqrt") {
	    
	    node.attr("r", function(d) {return (3*(Math.sqrt(d.count) + 1));})
	}else if(newscale == "log"){
	    node.attr("r", function(d) {return 3*(Math.abs(Math.log(d.count)) + 1);});
	}
    }

    function update_graph(url, colorby, scale){
	d3.json(url, function(error, graph) {
	    if (error) throw error;
	    
	    
	    var nodes = graph.nodes.slice(),
	    links = [],
	    bilinks = [];
	    
	    
	    graph.links.forEach(function(d) {
		if (typeof d.source == "number" && typeof d.target == "number") {
		    
		    var s = nodes[d.source];
		    var t = nodes[d.target];
		    if(s.cluster == t.cluster){
			var i = {}; // intermediate node
			nodes.push(i);
			links.push({source: s, target: i, value: 1}, 
				   {source: i, target: t, value: 1});
			//links.push({source: s, target: t});
			bilinks.push([s, i, t]);
			
			//links.push({source: s, target: t, value: 1});
			//bilinks.push([s,t]);
		    }
		}
		
	    });
	    
	    //console.log(nodes)
	    //console.log(links)
	    
	    force
		.nodes(nodes)
		.links(links)
		.start();
	    
	    link = svg.selectAll(".link")
		.data(bilinks);
	    link.enter().append("path")
		.attr("class", "link")
	    
	    node = svg.selectAll(".node")
		.data(graph.nodes);
	    node.enter().append("circle")
		.attr("class", "node")
		.call(force.drag);
	   
	    //.attr("r", function(d) {return d.count;})
	    //(3*(Math.sqrt(d.count) + 1));})
	    //(Math.abs(Math.log(d.count) ) + 1);})
	    if (scale == "linear"){
		node.attr("r", function(d) {return d.count;});
	    }else if(scale == "sqrt") {
		node.attr("r", function(d) {return (3*(Math.sqrt(d.count) + 1));});
	    }else if(scale == "log") {
		node.attr("r", function(d) {return 3*(Math.abs(Math.log(d.count)) + 1);});
	    }
	    //
	    //(Math.abs(Math.log(d.count) ) + 1);})
	    if(topic == "all"){
		node.style("fill", function(d) { return color(d.topic); });
	    }else{
		node.style("fill", function(d) { return color(d.author); });
	    }
	    
	    svg.selectAll("title").remove();
	    if (topic == "all"){
		node.append("title")
		    .text(function(d) { return (d.topic + "\n" + d.author + "\n" +  d.count +" sentences\ncluster: " + d.cluster); });
		force
		    .charge(allcg)
		    .chargeDistance(allcgdist)
		    .start();
	    }else{
		node.append("title")
		    .text(function(d) { return (d.author + "\n" +  d.count + " sentences\ncluster: " + d.cluster); });
		force
		    .charge(cg)
		    .chargeDistance(cgdist)
		    .start();
	    }
	    
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
	    
	    node.exit().remove();
	    link.exit().remove();
	    
	    //================================
	    // update text

	    svg.select("#topictext")
		.text("Topic: " + topic)
		.attr("x", tlx)// cellSize*numbercells/2)
		.style("text-anchor", "left")
		.attr("y", 0)
	    svg.select("#colortext")
		.text("Color by: " + colorby)
		.attr("x", tlx)
		.style("text-anchor", "left")
		.attr("y", tloffset)
	    //textlegend.exit().remove();
	    //==========================================
	   
	    //
	    //(Math.abs(Math.log(d.count) ) + 1);})
	    //svg.selectAll(".node")
		//.style("fill", function(d) { return color(d.author); })
		//.call(force.drag);
	
	    
	    
	    
	    
	});
    }

}
