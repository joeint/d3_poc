function draw(data)
{
        var margins = {top: 10, right: 20, bottom: 30, left: 60};
        var container_dimensions = {width: 1200, height: 100};

        var chart_dimensions = 
        {
        	width:  container_dimensions.width  - margins.left - margins.right, 
        	height: container_dimensions.height - margins.top - margins.bottom
        };


        var chart = d3.select("#divergence")        		
        			.attr("height", container_dimensions.height)
        			.attr("width", container_dimensions.width)
                    .append("g")
        			.attr("id", "chart")
        			.attr("transform", "translate(" + margins.left + ", " + margins.top + ")");


    	// var account_scale = d3.scale.linear()
    	// 	.domain([0, 100])
    	// 	.range([0, chart_dimensions.width]);

        var helper = new Analyzer(data);

        var account_scale = d3.scale.ordinal().rangeRoundBands([0, chart_dimensions.width], .1);
        account_scale.domain(data.map(function(d) {return d.Lvl_1; }))  

        // var account_scale = d3.scale.log()         
        //  .range([0, chart_dimensions.width])
        //  .base(2)
        // account_scale.domain(data.map(function(d) {return d.MV_Z; }))  

        var yScale = d3.scale.linear()                
            // .range([d3.max(data, function(d) { return helper.y(d.Mkt_Val_Z)}), 0]);
            // .range([50,-50])
            // .range([-50, 50])
            // .range([chart_dimensions.height, 0])
            .range([Math.exp(4), 0])

        // var yScale = d3.scale.identity()
        //             .range([helper.y(-3), helper.y(3)])

        // y.domain([d3.min(data, function(d) { return helper.y(d)}), d3.max(data, function(d) { return helper.y(d)})]);            
        yScale.domain([helper.y(-3) , helper.y(3)])
        // y.domain([-50, 50])

    	var account_axis = d3.svg.axis()
    		.scale(account_scale)      
            .tickSize(30)                  

    	chart.append("g")
    		.attr("class", "x axis")
    		.attr("transform", "translate(0, " + yScale(helper.y(0))+ ")")            
    		.call(account_axis)
            .selectAll("text")
                // .style("text-anchor", "end")
                // .attr("dx", "-.8em")
                // .attr("dy", ".15em")
                // .attr("x", "-1.2em")
                // .attr("y", ".15em")
                // .attr("transform", function(d) {
                //     return "rotate(-90)" 
                //     });



        // chart.selectAll(".tick text").text("joe")        
        chart.selectAll(".tick").each(function(data) {            
            var tick = d3.select(this);
            var x = helper.bucketTickPosition(data);

            tick.attr("transform", "translate(" + x + ",0)");
        })
                 	
    	
    	chart.selectAll("circle")
    		.data(data)
    		.enter()
    		.append("circle")
                .attr("cx", function(d, i) { return helper.x(d, i) })                    
                .attr("cy", function(d, i) { return yScale(helper.y(d.Mkt_Val_Z,i)) })
    			.attr("r" , 5)
                .style("fill", function(d,i) {
                    var yVal = helper.y(d, i);                    
                    if (yVal > 10 && yVal <= 20)  {
                        return "green";
                    }
                    else if (yVal >50 && yVal <=80) {
                        return "purple"
                    }
                    else {                    
                        return "red"
                    }
                    // return color(helper.y(d,i))
                })
    		.append("svg:title")
    			.text(function(d) { return d.Aladdin_Account_ID});

  }