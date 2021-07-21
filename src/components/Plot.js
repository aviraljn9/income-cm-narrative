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
        if (this.timerID === null) {
            if (this.state.year == 2021) {
                y_domain = 150;
            }
            radius = 3;
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
        .attr('fill', 'lightblue')
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
        
    }

    async componentDidMount()
    {
        // console.log('plot mounted')
        console.log(process.env.PUBLIC_URL)
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
                    <button onClick = {this.setCurrentYear}>Display complete curve</button>
                </div>

                <div id='ttip'></div>

                <svg id='scatter' width={800} height={800} ref = {this.svgRef}>

                </svg>
            </div>
        )
    }
}

export default Plot
