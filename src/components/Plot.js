import React, { Component } from 'react'
import * as d3 from "d3";

export class Plot extends Component {
    constructor(props) {
        super(props);
        this.svgRef = React.createRef();

        this.state = {
            'year': 1800
        }
        this.setyear =this.setyear.bind(this);
        this.tick =this.tick.bind(this);
        this.setCurrentYear =this.setCurrentYear.bind(this);
    }    

	leastSquares(xSeries, ySeries) {
		var reduceSumFunc = function(prev, cur) { return prev + cur; };
            
		var xBar = xSeries.reduce(reduceSumFunc) * 1.0 / xSeries.length;
		var yBar = ySeries.reduce(reduceSumFunc) * 1.0 / ySeries.length;

		var ssXX = xSeries.map(function(d) { return Math.pow(d - xBar, 2); })
			.reduce(reduceSumFunc);
		
		var ssYY = ySeries.map(function(d) { return Math.pow(d - yBar, 2); })
			.reduce(reduceSumFunc);
			
		var ssXY = xSeries.map(function(d, i) { return (d - xBar) * (ySeries[i] - yBar); })
			.reduce(reduceSumFunc);
            
		var slope = ssXY / ssXX;
		var intercept = yBar - (xBar * slope);
		var rSquare = Math.pow(ssXY, 2) / (ssXX * ssYY);
		
		return [slope, intercept, rSquare];
	}

    updatechart()
    {
        const year_income = this.incomedata.map(
            (x) => {                 
                let cm_country = this.cm_data.find(y => y.country === x.country);
                if (cm_country === undefined) {
                    return null;
                }
                if (isNaN(x[this.state.year]) || isNaN(cm_country[this.state.year]))
                {
                    return null;
                }
                return {'country': x.country, 'income': x[this.state.year], 'child_mortality': cm_country[[this.state.year]]} 
            }
        ).filter(
            x => {
                if (x.child_mortality > 0) return true;
                return false;
            }
        )
        // console.log(year_income);

        let y_domain = 1000;
        let radius = 1.5;
        let color = 'lightblue'
        if (this.timerID === null) {
            if (this.state.year == 2021) {
                y_domain = 150;
            }
            radius = 3;
        }

        if (this.state.year > 2021)
        {
            color = 'red'
        }
        if (this.state.year == 2021)
        {
            color = 'orange'
        }

        const scalex = d3.scaleLog()
        .domain([200,179000])
        .range([0,700])
        const scaley = d3.scaleLinear()
        .domain([0,y_domain])
        .range([700,0])

        d3.select('#scatter').html("");
        d3.select('#ttip').html("");

        var div = d3.select('#ttip').append("div")	
        .attr("class", "tooltip")				
        .style("opacity", 0);    

        d3.select('#scatter').append('g')
        .attr('transform','translate(50,50)')
        .selectAll('circle')
        .data(year_income)
        .enter()
        .append('circle')
        .attr('cx',function(d,i) { return scalex(d.income); })
        .attr('cy',function(d,i) { return scaley(d.child_mortality); })
        .attr('r',function(d,i) { return radius; })
        .attr('fill', color)
        .on("mouseover", function(event, d) {		
            div.transition()		
                .duration(200)		
                .style("opacity", 1);		
            div.html(d.country + "<br/>" + d.income + "<br/>"  + d.child_mortality)	
                .style("left", (event.pageX) + "px")		
                .style("top", (event.pageY - 28) + "px");	
            })					
        .on("mouseout", function(d) {		
            div.transition()		
                .duration(500)		
                .style("opacity", 0);	
            });
    
        d3.select('#scatter').append('g')
        .attr('transform','translate(50,50)')
        .call(
            d3.axisLeft(scaley)
            // .tickValues([10,100,1000,10000, 100000])
            .tickFormat(d3.format("~s"))
        )
        d3.select('svg').append('g')
        .attr('transform','translate(50,750)')
        .call(
            d3.axisBottom(scalex)
            .tickValues([300,1000,3000,10000, 30000, 100000])
            .tickFormat(d3.format("~s"))
        )

        if (this.timerID === null)
        {
            var ySeries = year_income.map(x => parseFloat(scaley(x.child_mortality)));
            var xSeries = year_income.map(x => parseFloat(scalex(x.income)));
    
            var leastSquaresCoeff = this.leastSquares(xSeries, ySeries);
		
            var x1 = 0;
            var y1 = leastSquaresCoeff[1];
            var y2 = 700;
            var x2 = (y2 - leastSquaresCoeff[1]) / leastSquaresCoeff[0];

            if (x2 > 700)
            {
                x2 = 700
                y2 = leastSquaresCoeff[0] * x2 + leastSquaresCoeff[1]
            }
            var trendData = [[x1,y1,x2,y2]];
            
            var trendline = d3.select('#scatter').append('g')
            .attr('transform','translate(50,50)')
            .selectAll(".trendline")
            .data(trendData);
                
            trendline.enter()
                .append("line")
                .attr("class", "trendline")
                .attr("x1", function(d) { return d[0]; })
                .attr("y1", function(d) { return d[1]; })
                .attr("x2", function(d) { return d[2]; })
                .attr("y2", function(d) { return d[3]; })
                .attr("stroke", "black")
                .attr("stroke-dasharray", "4")
                .attr("stroke-width", 1);

            var xt = 500
            var yt = 300

            var txtbox = d3.select('#scatter').append('g')
            .attr('transform','translate(50,50)')
            .append('text')
            .attr("x", xt)
            .attr("y", yt)
            .attr("class", "text-label")
            .text("Negative slope of ")
            // .attr("textLength", 200)

            txtbox.append('tspan')
            .text("trend line indicates ")
            .attr("x", xt)
            .attr("y", yt + 20)
            // .attr("textLength", 200)    
            txtbox.append('tspan')
            .text("the correlation")
            .attr("x", xt)
            .attr("y", yt + 40)
            // .attr("textLength", 200)    
            txtbox.append('tspan')
            .text("between income and")
            .attr("x", xt)
            .attr("y", yt + 60)
            // .attr("textLength", 200)    
            txtbox.append('tspan')
            .text("child mortality")
            .attr("x", xt)
            .attr("y", yt + 80)
            // .attr("textLength", 200)    

            d3.select('#scatter').append('g')
            .attr('transform','translate(50,50)')
            .append("defs")
            .append("marker")
            .attr('id','arrow')
            .attr('viewBox',"0 -5 10 10")
            .attr('refX',5)
            .attr('refY',0)
            .attr('markerWidth',12)
            .attr('markerHeight',12)
            .attr('orient','auto')
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("class","arrowHead");

            var x3 = x2 - 100
            var y3 = leastSquaresCoeff[0] * x3 + leastSquaresCoeff[1]

            d3.select('#scatter').append('g')
            .attr('transform','translate(50,50)')                
            .append("line")
            .attr("class", "labelline")
            .attr("x1", xt + 50)
            .attr("y1", yt + 90)
            .attr("x2", function(d) { return x3; })
            .attr("y2", function(d) { return y3 - 5; })
            .attr("stroke", "black")
            // .attr("stroke-dasharray", "4")
            .attr("stroke-width", 1)
            .attr("marker-end", "url(#arrow)")
                                    
        }
        
    }

    async componentDidMount()
    {
        // console.log('plot mounted')
        this.incomedata = await d3.csv(process.env.PUBLIC_URL + '/income_processed.csv');
        // console.log(this.incomedata);
        this.cm_data = await d3.csv(process.env.PUBLIC_URL + '/child_mortality_0_5_year_olds_dying_per_1000_born.csv');
        // console.log(this.cm_data);

        this.updatechart();
        this.timerID = setInterval(
            () => this.tick(),
            25
        );      
    }

    componentWillUnmount() {
        console.log('Unmounting')
        clearInterval(this.timerID);
        this.timerID = null;
        d3.select('#scatter').html("");
        d3.select('#ttip').html("");
    }    

    componentDidUpdate()
    {
        this.updatechart();
    }

    tick()
    {
        if (this.state.year >= 2040)
        {
            clearInterval(this.timerID);
            this.timerID = null;
            this.setState((prevState, prevProps) => {
                return {
                    'year': 2021
                };
            }
            )
            return;
        }
        this.setState((prevState, prevProps) => {
            return {
                'year': prevState.year + 1
            };
        }
        )
    }

    setyear(event)
    {
        clearInterval(this.timerID);
        this.timerID = null;
        this.setState({'year': event.target.value});

    }

    setCurrentYear()
    {
        clearInterval(this.timerID);
        this.timerID = null;
        this.setState({'year': 2021});

    }

    render() {
        return (
            <div>
                <form>
                    <label for="year">Please select a year: </label>
                    <input type="range" min={1800} max={2040} step={1} id="year" value={this.state.year} onInput={this.setyear} />
                    <output name="selected_year" id="selected_year">{this.state.year}</output>
                </form>

                <br></br>
                <div>
                    <button onClick = {this.setCurrentYear}>Show 2021 data</button>
                    <button onClick = {() => this.props.resetFunc(this.props.sceneno)}>Restart this scene</button>
                </div>

                <div id='ttip'></div>

                <svg id='scatter' width={800} height={800} ref = {this.svgRef}>

                </svg>
            </div>
        )
    }
}

export default Plot
