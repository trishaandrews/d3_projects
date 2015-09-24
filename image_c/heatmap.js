var classesNumber = 10,
    cellSize = 40, numbercells = 10;
var coordinates = [0, 0];

//#########################################################
function heatmap_display(url, heatmapId, paletteName, model) {

    //==================================================
    // References
    // Patrick Brockmann: http://bl.ocks.org/PBrockmann/635179ff33f17d2d75c2
    // http://bl.ocks.org/d3noob/10633192
    // http://bl.ocks.org/mbostock/5577023

    //==================================================
   /* var tooltip = d3.select(heatmapId)
    //var tooltip = d3.select("g.tooltip.mouse")
        .append("div")
        .style("position", "absolute")
        .style("visibility", "hidden");*//*
    var mouseCoords = d3.mouse(tooltip.node().parentElement);*/
    //==================================================
    //var paddingheight = 0;//150;
    //var paddingwidth = 0;// 100;
    var viewerWidth = cellSize*numbercells + 250;
    //$(document).width()-paddingwidth;
    var viewerHeight = cellSize*numbercells + 250;
    //$(document).height()-paddingheight;
    var viewerPosTop = 100;
    var viewerPosLeft = 100;
    var antime = 500;
    var maxpercent = 0.65;
    var colornumber = 9;
    var legendrange = [];
    for (var i = 0; i< maxpercent; i = i + (maxpercent/colornumber)){
        legendrange.push(i);
    }
    var modeldir = "./heatmaps/";
    var maxlim = 500;
    var maxk = 300;
    var lim = 500;
    var k = 300;
    var accuracy = 0;
    var accuracies = [0];
    var legendElementWidth = cellSize;

    // http://bl.ocks.org/mbostock/5577023
    var colors = colorbrewer[paletteName][colornumber];

    // http://bl.ocks.org/mbostock/3680999
    var svg;
    
    //==================================================
    d3.json(url, function(error, data) {
	//var tooltip = d3.select(heatmapId)
	//	var mouseCoords = d3.mouse(tooltip.node().parentElement);

        var arr = data.data;
        var row_number = arr.length;
        var col_number = arr[0].length;
	
        var colorScale = d3.scale.quantize()
            .domain([0.0, maxpercent])
            .range(colors);

        svg = d3.select(heatmapId).append("svg")
            .attr("width", viewerWidth)
            .attr("height", viewerHeight)
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
            });

        var rowUpperLabel = svg.append("text")
            .text("True Label")
            .attr("class", "axislabeltext")
            .attr("transform", "rotate(-90)")
            .attr("x", -(cellSize*numbercells)/2)
            .attr("y", -65)
	    .style("text-anchor", "middle");

        var colLabels = svg.append("g")
            .attr("class", "colLabels")
            .selectAll(".colLabel")
            .data(data.columns)
            .enter().append("text")
            .text(function(d) {
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
            });

        var colUpperLabel = svg.append("text")
            .text("Predicted Label")
            .attr("class", "axislabeltext")
            .attr("y", -50)
            .attr("x", (cellSize*numbercells)/2)
	    .style("text-anchor", "middle");
            	
        var row = svg.selectAll(".row")
	    .data(data.data)
	    .enter().append("g")
	    .attr("id", function(d) {
	        return d.idx;
	    })
	    .attr("class", "row");

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
	    .style("fill", function(d, i, j) {
		if ( i == j) {
		    acc = d;///10;
		    if (acc != null){
			accuracies.push(acc);
		    }
		}
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
            .on("mousemove", function(d, i, j) {
		//console.log(d3.event.pageX)
                tooltip.style("top", (d3.event.pageY - 55) + "px").style("left", (d3.event.pageX - 60) + "px");
            })/*
           .on("mousemove", function(d, i, j) {
                // //- 340
                 coordinates = d3.mouse(this);
                 var x = coordinates[0];
                 var y = coordinates[1];
                 tooltip.style("top",  (y+50) +"px").style("left",  (x+50) +"px");
	       //tooltip.attr("transform", "translate("+this.getAttribute("cx")+"," +this.getAttribute("cy")+")");
            })*/
            .on('click', function() {
                changeOrder(heatmapId, antime);
            });
	
	var tooltip = svg.append("g")
	//var tooltip = d3.select("g.tooltip.mouse")
	    .attr("class", "heatmap_tooltip")
            //.append("div")
            .style("position", "absolute")
            //.style("visibility", "hidden");

        var legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate("+ (cellSize*numbercells - 40) + ", 0)")
            .selectAll(".legendElement")
            .data(legendrange)
            .enter().append("g")
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
	var tloffset = 30; 
	var textlegend = svg.append("g")
	    .attr("class", "textlegend")
            .attr("transform", "translate(0, "+(cellSize*numbercells + 30)+")")
	
	textlegend.append("text")
	    .attr("class", "mono textlegendElement")
	    .attr("id", "acctext")
	    .text("Overall Accuracy: " + getAccuracy())
	    .attr("x", cellSize*numbercells/2)
	    .style("text-anchor", "middle")
	    .attr("y", 0)

	textlegend.append("text")
	    .attr("class", "mono textlegendElement")
	    .attr("id", "modeltext")
	    .text("Current Model: " + modelname(model))
	    .attr("x", cellSize*numbercells/2)
	    .style("text-anchor", "middle")
	    .attr("y", tloffset)

	textlegend.append("text")
            .attr("class", "mono textlegendElement")
	    .attr("id", "limtext")
            .text("Number of Training Images: " + lim)
            .attr("x", cellSize*numbercells/2)
	    .style("text-anchor", "middle")
	    .attr("y", 2*tloffset)

	textlegend.append("text")
	    .attr("class", "mono textlegendElement")
	    .attr("id", "ktext")
	    .text("Number of Feature Centers per Label: " + k) //SIFT Clusters
	    .attr("x", cellSize*numbercells/2)
	    .style("text-anchor", "middle")
	    .attr("y", 3*tloffset)
	
	
        //==================================================
        // Read and update lim and k from sliders
        //function updatelimk() {
        var newlim;
        var newk;
        // read a change in the training image input
        d3.select("#lim").on("input", function() {
            newlim = checknewness(this.value, maxlim, 5);
	    lim = newlim
	    update(model, newlim, k);
        });

        // read a change in the cluster input
        d3.select("#k").on("input", function() {
            newk = checknewness(this.value, maxk);
	    k = newk
	    update(model, lim, newk);
        });

	// read a change in model
	//d3.select("#mname").on("input", function() {
	//    newmodel = checknewmodel(this.value);
	//    model = newmodel
	//    update(newmodel, lim, k);
	//});

	// read a change in model button
	$("input[name=mnradio]:radio").change(function () {
	    //console.log(this.value)
	    newmodel = this.value
	    update(newmodel, lim, k);
	});

	function checknewness(newval, maxval) {
	    //console.log(newval)
	    if (newval < 75){
		newval = 10;
		return newval;
	    }else if (newval >= 75 && newval < 150){
		newval = 50;
		return newval;
	    }else if (newval >= 150 && newval < 225){
		newval = 100;
		return newval;
	    }else if (newval >= 225 && newval < 350 ){
		newval = 300;
		return newval;
	    }else if (newval > 350 && newval < maxval){
		newval = 500;
		return newval;
	    }else{
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
        /*d3.select("#model").on("change", function() {
	    var newModel = d3.select("#model").property("value");
	    update(newModel, lim, k);
        });*/

	//===================================================
	function update (newmodel, newlim, newk){
	    var url = modeldir + newmodel + "_lim=" + newlim + "_k="+newk+".json";
	    d3.json(url, function(error, dataset) {
		accuracies = [0];
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
		    .style("fill", function(d, i, j) {
			if ( i == j) {
			    acc = d;///10;
			    if (acc != null){
				accuracies.push(acc);
			    }
			}
			if (d != null) return colorScale(d);
			else return "url(#diagonalHatch)";
		    });

		svg.select("#limtext")
		    .text("Number of Training Images: " + newlim)
		svg.select("#ktext")
		    .text("Number of Feature Centers per Label: " + newk) //SIFT Clusters
		svg.select("#modeltext")
		    .text("Current Model: " + modelname(newmodel))
		svg.select("#acctext")
		    .text("Overall Accuracy: " + getAccuracy())
		
	    });
	}
	//=================================================
	function getAccuracy(){
	    var count = 0;
	    for(var i=0, n=accuracies.length; i < n; i++) 
	    { 
		count += accuracies[i]; 
	    }
	    return (count/numbercells).toFixed(3);
	}
	    
        //==================================================
        /*d3.select("#palette")
            .on("keyup", function() {
		var newPalette = d3.select("#palette").property("value");
		if (newPalette != null)						// when interfaced with jQwidget, the ComboBox handles keyup event but value is then not available ?
                	changePalette(newPalette, heatmapId, colornumber, maxpercent);
            })
            .on("change", function() {
		var newPalette = d3.select("#palette").property("value");
                changePalette(newPalette, heatmapId, colornumber, maxpercent);
            });*/
       
	//==================================================

    }); //end d3.json
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
function changePalette(paletteName, heatmapId, colornumber, maxpercent) {
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

