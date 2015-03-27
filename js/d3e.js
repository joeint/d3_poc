function draw(data)
{
        var margins = {top: 10, right: 20, bottom: 30, left: 60};
        var container_dimensions = {width: 750, height: 100};

        var chart_dimensions = 
        {
        	width:  container_dimensions.width  - margins.left - margins.right, 
        	height: container_dimensions.height - margins.top - margins.bottom
        };


        var maxGraphPlots = 50;
        if (data.length > maxGraphPlots) {
            for (var i=0; i<data.length; i+=maxGraphPlots) {

                var dataSmall = data.slice(i, i+maxGraphPlots);                                

                var chart = d3.select("#divergence")   
                            .append("div")                            
                            .append("svg")
                			.attr("height", container_dimensions.height)
                			.attr("width", container_dimensions.width)
                            .append("g")
                			.attr("id", "chart")
                			.attr("transform", "translate(" + margins.left + ", " + margins.top + ")");

                var helper = new Analyzer(dataSmall);

                var xScale = d3.scale.ordinal().rangeRoundBands([0, chart_dimensions.width], .1);                                
                xScale.domain(dataSmall.map(function(d) {return d.Lvl_1; }))  


                var yScale = d3.scale.linear()
                        .domain([helper.y(-3), helper.y(3)])
                        .range([Math.exp(4), 0])

            	var account_axis = d3.svg.axis()
            		.scale(xScale)     
                    //TODO: figure out why is there an extra tick when i specify the size???
                    //                   
                    // .tickSize(15)  
                    .orient("bottom")                

            	chart.append("g")
            		.attr("class", "x axis")
            		.attr("transform", "translate(0, " + yScale(0)+ ")")            
            		.call(account_axis)            
             
                
                chart.selectAll(".tick").each(function(dataSmall) {            
                    var tick = d3.select(this);
                    var x = helper.bucketTickPosition(dataSmall);

                    tick.attr("transform", "translate(" + x + ",0)");
                })
                         	
                
            	chart.selectAll("circle")
            		.data(dataSmall)
            		.enter()
            		.append("circle")
                        .attr("cx", function(d, i) { return helper.x(d, i) })                    
                        .attr("cy", function(d, i) { return yScale(helper.y(d.Mkt_Val_Z,i)) })
            			.attr("r" , 5)
                        .style("fill", function(d,i) {
                            return helper.color(d.Mkt_Val_Z);
                        })
            		.append("svg:title")
            			.text(function(d) { return d.Aladdin_Account_ID});              
            }
        }
  }