var classesNumber = 10,
    cellSize = 30;

//#########################################################
function heatmap_display(url, heatmapId, paletteName, model) {


    //##########################################################################
    // Patrick.Brockmann@lsce.ipsl.fr
    //##########################################################################
    
    //==================================================
    // References
    // http://bl.ocks.org/Soylent/bbff6cc507dca2f48792
    // http://bost.ocks.org/mike/selection/
    // http://bost.ocks.org/mike/join/
    // http://stackoverflow.com/questions/9481497/understanding-how-d3-js-binds-data-to-nodes
    // http://bost.ocks.org/mike/miserables/
    // http://bl.ocks.org/ianyfchang/8119685

    //==================================================
    var tooltip = d3.select(heatmapId)
        .append("div")
        .style("position", "absolute")
        .style("visibility", "hidden");

    //==================================================
    // http://bl.ocks.org/mbostock/3680958
    //function zoom() {
    	//svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    //}

    // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
    //var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);

    //==================================================
    var paddingheight = 150;
    var paddingwidth = 100;
    var viewerWidth = $(document).width()-paddingwidth;
    var viewerHeight = $(document).height()-paddingheight;
    var viewerPosTop = 100;
    var viewerPosLeft = 100;
    var antime = 500;
    var maxpercent = 0.65;
    var colornumber = 9;
    var numbercells = 10;
    var legendrange = [];
    for (var i = 0; i< maxpercent; i = i + (maxpercent/colornumber)){
        legendrange.push(i);
    }
    var modeldir = "./heatmaps/";
    //var model = "linsvc";
    var maxlim = 500;
    var maxk = 300;
    var lim = 500;
    var k = 300;
    var accuracy;
    var accuracies;
    var legendElementWidth = cellSize;

    // http://bl.ocks.org/mbostock/5577023
    var colors = colorbrewer[paletteName][colornumber];//[classesNumber];

    // http://bl.ocks.org/mbostock/3680999
    var svg;
    
    //==================================================
    d3.json(url, function(error, data) {
	var dsv = d3.dsv(" ", "text/plain");
	accuracies = dsv(modeldir+"accuracies.txt", function(i, dsvdata) {
	    /*accuracies = dsvdata.map(function(d) {
		return[+d["lim"],
		       +d["k"],
		       +d["model"],
		       +d["accuracy"]
		      ]
	    });*/
	    //accuracies = dsvdata;
	    //dsvdata = function(d) { return dsv.parse(d)}
	    //.row(function(d) { 
	//	return dsv.parse(d) })
	  //  .get(function(error, rows) { console.log(rows); });
	    //return dsvdata.data
	    console.log(dsvdata[0]);
	    console.log(i);
	    return dsvdata;
	 });
	
	
        console.log(accuracies);
        var arr = data.data;
        var row_number = arr.length;
        var col_number = arr[0].length;
        //console.log(col_number, row_number);
	
        var colorScale = d3.scale.quantize()
            .domain([0.0, maxpercent])
            .range(colors);

        svg = d3.select(heatmapId).append("svg")
            .attr("width", viewerWidth)
            .attr("height", viewerHeight)
	    //.call(zoomListener)
            .append("g")
            .attr("transform", "translate(" + viewerPosLeft + "," + viewerPosTop + ")");

        svg.append('defs')
            .append('pattern')
            .attr('id', 'diagonalHatch')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 4)
            .attr('height', 4)
            .append('path')
            .attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
            .attr('stroke', '#000000')
            .attr('stroke-width', 1);
        var rowSortOrder = false;
        var colSortOrder = false;

        var rowLabels = svg.append("g")
            .attr("class", "rowLabels")
            .selectAll(".rowLabel")
            .data(data.index)
            .enter().append("text")
            .text(function(d) {
                return d.count > 1 ? d.join("/") : d;
            })
            .attr("x", 0)
            .attr("y", function(d, i) {
                return (i * cellSize);
            })
            .style("text-anchor", "end")
            .attr("transform", function(d, i) {
                return "translate(-3," + cellSize / 1.5 + ")";
            })
            .attr("class", "rowLabel mono")
            .attr("id", function(d, i) {
                return "rowLabel_" + i;
            })
            .on('mouseover', function(d, i) {
                d3.select('#rowLabel_' + i).classed("hover", true);
            })
            .on('mouseout', function(d, i) {
                d3.select('#rowLabel_' + i).classed("hover", false);
            })
            .on("click", function(d, i) {

                rowSortOrder = !rowSortOrder;
                sortByValues("r", i, rowSortOrder);
                //d3.select("#order").property("selectedIndex", 0);
                //$("#order").jqxComboBox({selectedIndex: 0});
            });

        var rowUpperLabel = svg.append("text")
            .text("True Label")
            .attr("class", "axislabeltext")
            .attr("transform", "rotate(-90)")
            .attr("x", -(cellSize*numbercells)/2)//-45)//-50)
            .attr("y", -65)//-(cellSize*10)/2)//-45)
	    .style("text-anchor", "middle");

        var colLabels = svg.append("g")
            .attr("class", "colLabels")
            .selectAll(".colLabel")
            .data(data.columns)
            .enter().append("text")
            .text(function(d) {
                //d.shift();
                return d.count > 1 ? d.reverse().join("/") : d.reverse();
            })
            .attr("x", 0)
            .attr("y", function(d, i) {
                return (i * cellSize);
            })
            .style("text-anchor", "left")
            .attr("transform", function(d, i) {
                return "translate(" + cellSize / 2 + ", -3) rotate(-90) rotate(45, 0, " + (i * cellSize) + ")";
            })
            .attr("class", "colLabel mono")
            .attr("id", function(d, i) {
                return "colLabel_" + i;
            })
            .on('mouseover', function(d, i) {
                d3.select('#colLabel_' + i).classed("hover", true);
            })
            .on('mouseout', function(d, i) {
                d3.select('#colLabel_' + i).classed("hover", false);
            })
            .on("click", function(d, i) {
                colSortOrder = !colSortOrder;
                sortByValues("c", i, colSortOrder);
                //d3.select("#order").property("selectedIndex", 0);
            });

        var colUpperLabel = svg.append("text")
            .text("Predicted Label")
            .attr("class", "axislabeltext")
            .attr("y", -50)//-(cellSize*10)/2)//-45)//-50)
            .attr("x", (cellSize*numbercells)/2)//-65)//-(cellSize*10)/2)//-45)
	    .style("text-anchor", "middle");
            
	
	//var heatMap = update(model, lim, k);
        var row = svg.selectAll(".row")
	    .data(data.data)
	    .enter().append("g")
	    .attr("id", function(d) {
	        return d.idx;
	    })
	    .attr("class", "row");

	//var row = update(heatmapId, model, modeldir, lim, k);
	var j = 0;
	var heatMap = row.selectAll(".cell")
	    .data(function(d) {
		j++;
		return d;
	    })
	    .enter().append("svg:rect")
	    .attr("x", function(d, i) {
		return i * cellSize;
	    })
	    .attr("y", function(d, i, j) {
		return j * cellSize;
	    })
	    .attr("rx", 4)
	    .attr("ry", 4)
	    .attr("class", function(d, i, j) {
		return "cell bordered cr" + j + " cc" + i;
	    })
	    .attr("row", function(d, i, j) {
		return j;
	    })
	    .attr("col", function(d, i, j) {
		return i;
	    })
	    .attr("width", cellSize)
	    .attr("height", cellSize)
	    .style("fill", function(d) {
		if (d != null) return colorScale(d);
		else return "url(#diagonalHatch)";
	    })
	    .on('mouseover', function(d, i, j) {
		d3.select('#colLabel_' + i).classed("hover", true);
		d3.select('#rowLabel_' + j).classed("hover", true);
		if (d != null) {
                    tooltip.html('<div class="heatmap_tooltip">' + d.toFixed(3) + '</div>');
                    tooltip.style("visibility", "visible");
                } else
                    tooltip.style("visibility", "hidden");
            })
            .on('mouseout', function(d, i, j) {
                d3.select('#colLabel_' + i).classed("hover", false);
                d3.select('#rowLabel_' + j).classed("hover", false);
                tooltip.style("visibility", "hidden");
            })
            .on("mousemove", function(d, i) {
                tooltip.style("top", (d3.event.pageY - 55) + "px").style("left", (d3.event.pageX - 60) + "px");
            })
            .on('click', function() {
                //console.log(d3.select(this));
                changeOrder(heatmapId, antime);
            });

        var legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(250, 0)")
            .selectAll(".legendElement")
            .data(legendrange)
            //.data([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7])//, 0.8, 0.9])
            .enter().append("g")
	    //.uexit().remove()
            .attr("class", "legendElement");

        legend.append("svg:rect")
            .attr("y", function(d, i) {
                return legendElementWidth * i;
            })
            .attr("x", viewerPosTop)// - 20)
            .attr("class", "cellLegend bordered")
            .attr("height", legendElementWidth)
            .attr("width", cellSize / 2)
            .style("fill", function(d, i) {
                return colors[i];
            });

        legend.append("text")
            .attr("class", "mono legendElement")
            .text(function(d) {
                return "≥" + Math.round(d * 100) / 100;
            })
            .attr("y", function(d, i) {
                return legendElementWidth * i + (legendElementWidth/2);
            })
            .attr("x", viewerPosTop + cellSize);// - 20);

	//==========================================
	// Text legend
	var textlegend = svg.append("g")
	    .attr("class", "textlegend")
            .attr("transform", "translate(0, 350)")
	
	textlegend.append("text")
	    .attr("class", "mono textlegendElement")
	    .attr("id", "modeltext")
	    .text("Current Model: " + modelname(model))
	    .attr("x", cellSize*numbercells/2)
	    .style("text-anchor", "middle")

	textlegend.append("text")
            .attr("class", "mono textlegendElement")
	    .attr("id", "limtext")
            .text("Number of Training Images: " + lim)
            .attr("x", cellSize*numbercells/2)
	    .style("text-anchor", "middle")
	    .attr("y", 30)
            //})
            //.attr("y", 0)//viewerPosTop + cellSize - 20);
	textlegend.append("text")
	    .attr("class", "mono textlegendElement")
	    .attr("id", "ktext")
	    .text("Number of SIFT Clusters per class: " + k)
	    //.attr("x", 10)
	    .attr("x", cellSize*numbercells/2)
	    .style("text-anchor", "middle")
	    .attr("y", 60)
	
	
        //==================================================
        // Read and update lim and k from sliders
        //function updatelimk() {
        var newlim;
        var newk;
        // read a change in the training image input
        d3.select("#lim").on("input", function() {
            newlim = checknewness(this.value, maxlim, 5);
	    //if (newlim != lim){
		//lim = newlim
	    lim = newlim
	    update(model, newlim, k);
	    //}
        });

        // read a change in the cluster input
        d3.select("#k").on("input", function() {
            newk = checknewness(this.value, maxk);
	    //if (newk != k){
	    //k = newk
	    k = newk
	    update(model, lim, newk);
	    //}//newk = this.value;
        });
	// read a change in model
	d3.select("#mname").on("input", function() {
	    newmodel = checknewmodel(this.value);
	    model = newmodel
	    update(newmodel, lim, k);
	});
        //}
	function checknewness(newval, maxval) {
	    //console.log(newval)
	    if (newval < 75){//(maxval/num)) {
		newval = 10;
		return newval;
	    }else if (newval >= 75 && newval < 150){//(maxval/num) && newval <= (maxval/num)*2){
		newval = 50;
		return newval;
	    }else if (newval >= 150 && newval < 225){//(maxval/num)*2 && newval <= (maxval/num)*3){
		newval = 100;
		return newval;
	    }else if (newval >= 225 && newval < 300){//(maxval/num)*3 && newval <= (maxval/num)*4){
		newval = 300;
		return newval;
	    }else if (newval > 300 && newval < maxval){
		newval = 500;
		return newval;
	    }else{
		//console.log("bad final:" + newval)
		return maxval;
	    }
	}

	function checknewmodel(newval) {
	    if (newval <= 100){
		newmodel = "tree";
	    }else if (newval <= 200) {
		newmodel = "rf";
	    }else if (newval <= 300) {
		newmodel = "logreg";
	    }else if (newval <= 400) {
		newmodel = "gnb";
	    }else if (newval <= 500) {
		newmodel = "mnb";
	    }else {
		newmodel = "linsvc";
	    }
	    return newmodel
	 }

	function modelname(model) {
	    if (model == "tree"){
		mname = "Decision Tree";
	    }else if (model == "rf") {
		mname = "Random Forrest";
	    }else if (model == "logreg") {
		mname = "Logistic Regression";
	    }else if (model == "linsvc") {
		mname = "Linear SVC";
	    }else if (model == "gnb") {
		mname = "Gaussian Naive Bayes";
	    }else {
		mname = "Multinomial Naive Bayes";
	    }
	    return mname
	}
        //==================================================
        // Change ordering of cells
        function sortByValues(rORc, i, sortOrder) {
            var t = svg.transition().duration(antime);
            var values = [];
            var sorted;
            d3.selectAll(".c" + rORc + i)
                .filter(function(d) {
                    if (d != null) values.push(d);
                    else values.push(-999); // to handle NaN
                });
            //console.log(values);		
            if (rORc == "r") { // sort on cols
                sorted = d3.range(col_number).sort(function(a, b) {
                    return values[b] - values[a];
                });
                t.selectAll(".cell")
                    .attr("x", function(d) {
                        var col = parseInt(d3.select(this).attr("col"));
                        return sorted.indexOf(col) * cellSize;
                    });
                t.selectAll(".colLabel")
                    .attr("y", function(d, i) {
                        return sorted.indexOf(i) * cellSize;
                    })
                    .attr("transform", function(d, i) {
                        return "translate(" + cellSize / 2 + ", -3) rotate(-90) rotate(45, 0, " + (sorted.indexOf(i) * cellSize) + ")";
                    });
            }else { // sort on rows
                sorted = d3.range(row_number).sort(function(a, b) {
                    return values[b] - values[a];
                });
                t.selectAll(".cell")
                    .attr("y", function(d) {
                        var row = parseInt(d3.select(this).attr("row"));
                        return sorted.indexOf(row) * cellSize;
                    });
                t.selectAll(".rowLabel")
                    .attr("y", function(d, i) {
                        return sorted.indexOf(i) * cellSize;
                    })
                    .attr("transform", function(d, i) {
                        return "translate(-3," + cellSize / 1.5 + ")";
                    });
            }
        }

        //==================================================
        d3.select("#model").on("change", function() {
	    var newModel = d3.select("#model").property("value");
	    //var url = modeldir + newModel + "_lim=" + lim + "_k="+k+".json";
	    //d3.selectAll("svg").remove()	
            //heatmap_display(url, heatmapId, paletteName, model, lim, k);
	    update(newModel, lim, k);
            //svg.exit().remove();
            //changeModel(newModel, lim, k, heatmapId, paletteName, modeldir);
        });

	//===================================================
	function update (newmodel, newlim, newk){
	    var url = modeldir + newmodel + "_lim=" + newlim + "_k="+newk+".json";
	    //d3.selectAll("svg > *").remove();
	    //d3.selectAll("svg").remove();	
	    //heatmap_display(url, heatmapId, paletteName, model, lim, k);
	    //svg.selectAll(".row")
	    //data.data = updatedata(url)
	    //return data.data
	    
	    d3.json(url, function(error, dataset) {
		//var svg = d3.select(heatmapId);
		var t = svg.transition().duration(100);
		svg.selectAll(".row")
		    .data(dataset.data)
		    .enter()
		    .append("g")
		    .attr("id", function(d) {
		        return d.idx;
		    })
		    .attr("class", "row");

		row.selectAll(".cell")
		    .data(function(d) {
			j++;
			return d;
		    })
		    .style("fill", function(d) {
			if (d != null) return colorScale(d);
			else return "url(#diagonalHatch)";
		    });

		svg.select("#limtext")
		    .text("Number of Training Images: " + newlim)
		svg.select("#ktext")
		    .text("Number of SIFT Clusters per class: " + newk)
		svg.select("#modeltext")
		    .text("Current Model: " + modelname(newmodel))
		
		//rw = svg.selectAll(".row")
		//cl = svg.selectAll(".cell")
		//console.log(rw)
		//console.log(cl)
		//return data.data;
	    });
	    //return data.data;
	}
        //==================================================
        d3.select("#palette")
            .on("keyup", function() {
		var newPalette = d3.select("#palette").property("value");
		if (newPalette != null)						// when interfaced with jQwidget, the ComboBox handles keyup event but value is then not available ?
                	changePalette(newPalette, heatmapId);
            })
            .on("change", function() {
		var newPalette = d3.select("#palette").property("value");
                changePalette(newPalette, heatmapId);
            });
        //PuBu:{3:["#ece7f2","#a6bddb","#2b8cbe"],4:["#f1eef6","#bdc9e1","#74a9cf","#0570b0"],5:["#f1eef6","#bdc9e1","#74a9cf","#2b8cbe","#045a8d"],6:["#f1eef6","#d0d1e6","#a6bddb","#74a9cf","#2b8cbe","#045a8d"],7:["#f1eef6","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#034e7b"],8:["#fff7fb","#ece7f2","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#034e7b"],9:["#fff7fb","#ece7f2","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#045a8d","#023858"]},
       
    });

    //==================================================
}

//#########################################################
function changeOrder(heatmapId, antime) {
    var svg = d3.select(heatmapId);
    var t = svg.transition().duration(antime);
    
    t.selectAll(".cell")
        .attr("x", function(d) {
            var col = parseInt(d3.select(this).attr("col"));
            return col * cellSize;
        })
        .attr("y", function(d) {
            var row = parseInt(d3.select(this).attr("row"));
            return row * cellSize;
        });
    t.selectAll(".colLabel")
        .attr("y", function(d, i) {
            return i * cellSize;
        })
        .attr("transform", function(d, i) {
            return "translate(" + cellSize / 2 + ", -3) rotate(-90) rotate(45, 0, " + (i * cellSize) + ")";
        });
    t.selectAll(".rowLabel")
        .attr("y", function(d, i) {
            return i * cellSize;
        })
        .attr("transform", function(d, i) {
            return "translate(-3," + cellSize / 1.5 + ")";
        });
   
}

//#########################################################
function changePalette(paletteName, heatmapId) {
    var colors = colorbrewer[paletteName][colornumber];//[classesNumber];
    var colorScale = d3.scale.quantize()
        .domain([0.0, maxpercent])
        .range(colors);
    var svg = d3.select(heatmapId);
    var t = svg.transition().duration(500);
    t.selectAll(".cell")
        .style("fill", function(d) {
                if (d != null) return colorScale(d);
                else return "url(#diagonalHatch)";
        })
    t.selectAll(".cellLegend")
        .style("fill", function(d, i) {
            return colors[i];
        });
}
