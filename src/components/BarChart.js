import React, { Component } from 'react'
import * as d3 from "d3";

export class BarChart extends Component {
    constructor(props) {
        super(props);
        this.svgRef = React.createRef();

        this.state = {
            'year': 1800
        }
        this.setyear =this.setyear.bind(this);
        this.tick =this.tick.bind(this);
        this.setCurrentYear =this.setCurrentYear.bind(this);
        this.addannotation =this.addannotation.bind(this);

        this.max_year_reached = {}
    }    

    addannotation(x, y, txt1, txt2, txt3, xpoint, ypoint, xarrow, yarrow)
    {
        if (this.timerID === null && this.state.year == 2021)
        {
            var txtbox = d3.select('#scatter').append('g')
            .attr('transform','translate(50,50)')
            .append('text')
            .attr("x", x)
            .attr("y", y)
            .attr("class", "text-label")
            .text(txt1)

            txtbox.append('tspan')
            .text(txt2)
            .attr("x", x)
            .attr("y", y + 20)

            txtbox.append('tspan')
            .text(txt3)
            .attr("x", x)
            .attr("y", y + 40)
    

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

            d3.select('#scatter').append('g')
            .attr('transform','translate(50,50)')                
            .append("line")
            .attr("class", "labelline")
            .attr("x1", xpoint)
            .attr("y1", ypoint)
            .attr("x2", xarrow)
            .attr("y2", yarrow)
            .attr("stroke", "black")
            // .attr("stroke-dasharray", "4")
            .attr("stroke-width", 1)
            .attr("marker-end", "url(#arrow)")
        }
    }    


    updatechart()
    {
        let y_domain = 500;
        let radius = 1.5;

        let color = 'lightblue'
        if (this.state.year > 2021)
        {
            color = 'red'
        }
        if (this.state.year == 2021)
        {
            color = 'orange'
        }

        if (this.state.year == 2021 && this.timerID === null) {
            y_domain = 130;
            radius = 3;
        }

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

        const year_income_sorted = year_income.sort((a, b) => parseFloat(a.income) - parseFloat(b.income))
        const num_countries = year_income_sorted.length
        const num_groups = 10
        const num_countries_per_group = Math.floor(num_countries / num_groups)

        let groups = {}
        for (let index = 0; index < num_groups; index++) {
            groups[index] = []            
        }

        for (let index = 0; index < num_countries; index++) {
            let group_index = Math.floor(index / num_countries_per_group)
            group_index = Math.min(group_index, num_groups - 1)
            groups[group_index].push(year_income[index])            
        }

        let cm_group_averages = []
        const reducer = (accumulator, currentValue) => accumulator + parseFloat(currentValue);
        for (let index = 0; index < num_groups; index++)
        {
            let curr_group = groups[index]
            let count_group = curr_group.length
            let sum_cm_group = curr_group.map(
                (x) => x.child_mortality
            ).reduce(reducer, 0)
            let sum_income_group = curr_group.map(
                (x) => x.income
            ).reduce(reducer, 0)
            var cm_avg_this = (sum_cm_group / count_group).toFixed(2);
            cm_group_averages.push({'cm_avg': cm_avg_this, 'income_avg': (sum_income_group / count_group).toFixed(2)})

            if (cm_avg_this < 100)
            {
                if (!(index in this.max_year_reached))
                {
                    this.max_year_reached[index] = this.state.year;
                }
                else 
                {
                    this.max_year_reached[index] = Math.min(this.max_year_reached[index], this.state.year)
                }
            }
        }

        const scalex = d3.scaleBand()
        .domain([...Array(num_groups).keys()].map(x=>x+1))
        .range([0,700])
        .paddingInner(0.2)
        .paddingOuter(0.2);

        const scaley = d3.scaleLinear()
        .domain([0,y_domain])
        .range([700,0])
      
        const scaley_2 = d3.scaleLog()
        .domain([200,179000])
        .range([300,0])

        d3.select('#scatter').html("");

        this.addannotation(20, 200, "Average child mortality of", "group 1 countries dropped below 100", "for the first time in 2011", 100, 250, 40, 320)

        this.addannotation(300, 500, "For group 5, average below 100", "was reached in 1982", "", 370, 530, 320, 570)

        this.addannotation(550, 600, "And for group 10, 1949", "", "", 620, 610, 650, 660)

        // this.addannotation(cm_group_averages, scalex, scaley, 1, 20, 200, "Average child mortality of", "group 1 countries dropped below 100", "for the first time in 2011", 0, 0)

        d3.select('#ttip').html("");

        var div = d3.select('#ttip').append("div")	
        .attr("class", "tooltip")				
        .style("opacity", 0);    


        d3.select('#scatter').append('g')
        .attr('transform','translate(50,50)')
        .selectAll('rect')
        .data(cm_group_averages)
        .enter()
        .append('rect')
        .attr('x',function(d,i) { return scalex(i + 1); })
        .attr('y',function(d,i) { return scaley(d.cm_avg); })
        .attr('width',function(d,i) { return scalex.bandwidth(); })
        .attr('height',function(d,i) { return (700 - scaley(d.cm_avg)); })
        .attr('fill', color)
        .on("mouseover", function(event, d) {		
            div.transition()		
                .duration(200)		
                .style("opacity", 1);		
            div.html("Average Income: $" + d.income_avg + "<br/>Average Child Mortality: " + d.cm_avg)	
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

        d3.select('#scatter').append('text')
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("x", -300)
        .attr("y", 4)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .attr("font-size",14)
        .text('Average Child Mortality rate')

        d3.select('svg').append('g')
        .attr('transform','translate(50,750)')
        .call(
            d3.axisBottom(scalex)
            // .tickValues([300,1000,3000,10000, 30000, 100000])
            // .tickFormat(d3.format("~s"))
        )        

        d3.select('#scatter').append('text')
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", 550)
        .attr("y", 785)
        .attr("font-size",12)
        .text('Group number (grouped by average income ranks: 1(lowest) to 10(highest))')


    }

    async componentDidMount()
    {
        console.log('chart mounted')
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
            console.log(this.max_year_reached)
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
                    <output name="selected_year" id="selected_year"><b>{this.state.year}</b></output>
                </form>

                <br></br>
                <div>
                    <button onClick = {this.setCurrentYear}>Show annotated 2021 data</button>
                    <button onClick = {() => this.props.resetFunc(this.props.sceneno)}>Restart this scene</button>
                </div>

                <div id='ttip'></div>

                <svg id='scatter' width={800} height={800} ref = {this.svgRef}>

                </svg>
            </div>
        )
    }
}

export default BarChart
