import React, { Component } from 'react'
import * as d3 from "d3";

export class Chart extends Component {
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

    updatechart()
    {
        let y_domain = 500;
        let radius = 1.5;
        // if (this.state.year == 2021 && this.timerID === null) {
        //     y_domain = 150;
        //     radius = 3;
        // }

        let datafiltered = this.median_childmortality.filter(
            x => x.year <= this.state.year
        ).sort((x, y) => parseFloat(x.year) - parseFloat(y.year))

        let datafiltered2 = this.median_income.filter(
            x => x.year <= this.state.year
        ).sort((x, y) => parseFloat(x.year) - parseFloat(y.year))

        const scalex = d3.scaleLinear()
        .domain([1800,2040])
        .range([0,700])
        const scaley = d3.scaleLinear()
        .domain([0,y_domain])
        .range([300,0])

        const scaley_2 = d3.scaleLog()
        .domain([200,179000])
        .range([300,0])

        var valueline = d3.line()
        .x(function(d) { return scalex(d.year); })
        .y(function(d) { return scaley(d.median_val); });    

        d3.select('#scatter').html("");

        d3.select('#ttip').html("");

        var div = d3.select('#ttip').append("div")	
        .attr("class", "tooltip")				
        .style("opacity", 0);    
        
        this.addpath(datafiltered.filter(x => x.year <= 2021), 'steelblue', scalex, scaley, 'translate(50,50)')
        this.addpath(datafiltered.filter(x => x.year >= 2021), 'red', scalex, scaley, 'translate(50,50)')

        this.addtooltips(datafiltered, scalex, scaley, div, 'translate(50,50)')
    
        // g1.append("path")
        //     .attr("class", "line")
        //     .attr("d", valueline(datafiltered));
    
        d3.select('#scatter').append('g')
        .attr('transform','translate(50,50)')
        .call(
            d3.axisLeft(scaley)
            // .tickValues([10,100,1000,10000, 100000])
            .tickFormat(d3.format("~s"))
        )
        d3.select('svg').append('g')
        .attr('transform','translate(50,350)')
        .call(
            d3.axisBottom(scalex)
            // .tickValues([300,1000,3000,10000, 30000, 100000])
            // .tickFormat(d3.format("~s"))
        )

        this.addpath(datafiltered2.filter(x => x.year <= 2021), 'steelblue', scalex, scaley_2, 'translate(50,450)')
        this.addpath(datafiltered2.filter(x => x.year >= 2021), 'red', scalex, scaley_2, 'translate(50,450)')

        this.addtooltips(datafiltered2, scalex, scaley_2, div, 'translate(50,450)')        
    
        d3.select('#scatter').append('g')
        .attr('transform','translate(50,450)')
        .call(
            d3.axisLeft(scaley_2)
            .tickValues([300,1000,3000,10000,30000, 100000])
            .tickFormat(d3.format("~s"))
        )
        d3.select('svg').append('g')
        .attr('transform','translate(50,750)')
        .call(
            d3.axisBottom(scalex)
            // .tickValues([300,1000,3000,10000, 30000, 100000])
            // .tickFormat(d3.format("~s"))
        )
        

    }

    addpath(data, strk, scalex, scaley, translate)
    {
        d3.select('#scatter').append('g')
        .attr('transform', translate)
        .append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', strk)
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function(d) { return scalex(d.year); })
            .y(function(d) { return scaley(d.median_val); })
        )
    }

    addtooltips(data, scalex, scaley, div, translate)
    {
        d3.select('#scatter').append('g')
        .attr('transform',translate)
        .selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x',function(d,i) { return scalex(d.year); })
        .attr('y',function(d,i) { return 0; })
        .attr('width',function(d,i) { return 1; })
        .attr('height', function(d,i) { return 300; })
        .attr('fill', 'black')
        .attr('opacity', 0)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("opacity", 1)		
            div.transition()		
                .duration(200)		
                .style("opacity", 1);		
            div.html(d.year + "<br/>" + d.median_val)	
                .style("left", (event.pageX) + "px")		
                .style("top", (event.pageY - 28) + "px");	
            })					
        .on("mouseout", function(event, d) {		
            d3.select(this).attr("opacity", 0)		
            div.transition()		
                .duration(500)		
                .style("opacity", 0);	
            });
    }

    async componentDidMount()
    {
        console.log('chart mounted')
        this.incomedata = await d3.csv(process.env.PUBLIC_URL + '/income_processed.csv');
        // console.log(this.incomedata);
        this.cm_data = await d3.csv(process.env.PUBLIC_URL + '/child_mortality_0_5_year_olds_dying_per_1000_born.csv');
        // console.log(this.cm_data);
        this.median_childmortality = []
        this.median_income = []

        for (let index = 1800; index < 2041; index++) {
            let year_income = this.incomedata.map(
                (x) => {                 
                    let cm_country = this.cm_data.find(y => y.country === x.country);
                    if (cm_country === undefined) {
                        return null;
                    }
                    if (isNaN(x[index]) || isNaN(cm_country[index]))
                    {
                        return null;
                    }
                    return {'country': x.country, 'income': x[index], 'child_mortality': cm_country[[index]]} 
                }
            ).filter(
                x => {
                    if (x.child_mortality > 0) return true;
                    return false;
                }
            )

            // console.log(year_income.length)
            const reducer = (accumulator, currentValue) => accumulator + parseFloat(currentValue);
            let sum_cm = year_income.map(
                x => x.child_mortality
            ).reduce(reducer, 0)
            // console.log(sum_cm)

            this.median_childmortality.push({'year': index, 'median_val': sum_cm / year_income.length})

            let sum_income = year_income.map(
                x => x.income
            ).reduce(reducer, 0)
            this.median_income.push({'year': index, 'median_val': sum_income / year_income.length})
        }
        console.log(this.median_childmortality);
        console.log(this.median_income);

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
            // this.setState((prevState, prevProps) => {
            //     return {
            //         'year': 2021
            //     };
            // }
            // )
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
        this.setState({'year': 2040});

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
                    <button onClick = {this.setCurrentYear}>Display complete curve</button>
                </div>

                <div id='ttip'></div>

                <svg id='scatter' width={800} height={800} ref = {this.svgRef}>

                </svg>

            </div>
        )
    }
}

export default Chart
