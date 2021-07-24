import React, { Component } from 'react'
import * as d3 from "d3";

export class Chart extends Component {
    constructor(props) {
        super(props);
        this.svgRef = React.createRef();

        this.state = {
            'year': 1800,
            'country': 'average'
        }

        this.cm_plots = {}
        this.income_plots = {}

        this.setyear =this.setyear.bind(this);
        this.tick =this.tick.bind(this);
        this.setCurrentYear =this.setCurrentYear.bind(this);
        this.handleSelect =this.handleSelect.bind(this);
        this.addannotation =this.addannotation.bind(this);
    }    

    updatechart()
    {
        let y_domain = 500;

        let radius = 1.5;
        // if (this.state.year == 2021 && this.timerID === null) {
        //     y_domain = 150;
        //     radius = 3;
        // }
        if (this.state.country != 'average' && this.timerID === null) {
            y_domain = 1000;
        }


        var cm_country = this.cm_plots[this.state.country];
        let datafiltered = cm_country.filter(
            x => x.year <= this.state.year
        ).sort((x, y) => parseFloat(x.year) - parseFloat(y.year))

        var income_country = this.income_plots[this.state.country];
        let datafiltered2 = income_country.filter(
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
        .y(function(d) { return scaley(d.val); });    

        d3.select('#scatter').html("");

        d3.select('#ttip').html("");

        var div = d3.select('#ttip').append("div")	
        .attr("class", "tooltip")				
        .style("opacity", 0);    
        
        this.addpath(datafiltered.filter(x => x.year <= 2021), 'steelblue', scalex, scaley, 'translate(50,50)')
        this.addpath(datafiltered.filter(x => x.year >= 2021), 'red', scalex, scaley, 'translate(50,50)')

        this.addannotation(datafiltered, scalex, scaley, 'translate(50,50)', 1)
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
            .tickFormat(d3.format("d"))
        )

        this.addpath(datafiltered2.filter(x => x.year <= 2021), 'steelblue', scalex, scaley_2, 'translate(50,450)')
        this.addpath(datafiltered2.filter(x => x.year >= 2021), 'red', scalex, scaley_2, 'translate(50,450)')

        this.addannotation(datafiltered2, scalex, scaley_2, 'translate(50,450)', 2)
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
            .tickFormat(d3.format("d"))
        )
        
    }

    addannotation(data, scalex, scaley, translate, graphnum)
    {
        if (this.timerID === null && this.state.year > 1975)
        {
            var year1 = 1925;
            var year2 = 1975;
            var x1 = scalex(year1);
            var x2 = scalex(year2);
            var datay1 = data.filter(x => parseInt(x.year) == year1);
            var datay2 = data.filter(x => parseInt(x.year) == year2);
            if (datay1.length == 0 || datay2.length == 0)
            {
                return
            }

            var val1 = parseFloat(datay1[0].val)
            var val2 = parseFloat(datay2[0].val)

            var y1 = scaley(val1)
            var y2 = scaley(val2)

            d3.select('#scatter').append('g')
            .attr('transform',translate)                
                .append("rect")
                .attr("x", x1)
                .attr("y", Math.min(y1, y2))
                .attr("width", x2 - x1)
                .attr("height", Math.abs(y2-y1))
                .attr("stroke", "black")
                .attr("fill-opacity", 0.2)
                .attr("stroke-width", "3")
                .attr("stroke-dasharray", "4")

            var xt = x1
            var yt = Math.min(y1, y2) - 60;

            var percentage_increase = ((val2 / val1 - 1) * 100).toFixed(2);
            var txt1 = ""
            var txt2 = ""
            if (graphnum == 1)
            {
                percentage_increase = -percentage_increase
                txt1 = "decrease"
                txt2 = "child mortality"

                var txtbox = d3.select('#scatter').append('g')
                .attr('transform',translate)
                .append('text')
                .attr("x", xt)
                .attr("y", yt)
                .attr("class", "text-label")
                .text("Percentage " + txt1 + " in " )
    
                txtbox.append('tspan')
                .text(txt2 + " during ")
                .attr("x", xt)
                .attr("y", yt + 20)
                txtbox.append('tspan')
                .text("1925 - 1975: " + percentage_increase)
                .attr("x", xt)
                .attr("y", yt + 40)
    
            }

            if (graphnum == 2)
            {
                txt1 = "increase"
                txt2 = "income"

                var txtbox = d3.select('#scatter').append('g')
                .attr('transform',translate)
                .append('text')
                .attr("x", xt)
                .attr("y", yt + 20)
                .attr("class", "text-label")
                .text("...while percentage " + txt1)
    
                txtbox.append('tspan')
                .text("in income: " + percentage_increase)
                .attr("x", xt)
                .attr("y", yt + 40)
    
            }
        }
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
            .y(function(d) { return scaley(d.val); })
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
        .attr('class', 'ttrect')
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
            div.html(d.year + "<br/>" + d.val)	
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
        // console.log('chart mounted')
        this.incomedata = await d3.csv(process.env.PUBLIC_URL + '/income_processed.csv');
        // console.log(this.incomedata);
        this.cm_data = await d3.csv(process.env.PUBLIC_URL + '/child_mortality_0_5_year_olds_dying_per_1000_born.csv');
        // console.log(this.cm_data);

        this.cm_plots = {}
        this.cm_plots['average'] = []
        
        this.income_plots = {}
        this.income_plots['average'] = []

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

            for (let country_index = 0; country_index < year_income.length; country_index++) {
                const country_data = year_income[country_index];
                if (!(country_data.country in this.cm_plots))
                {
                    this.cm_plots[country_data.country] = [];
                    this.income_plots[country_data.country] = [];
                }
                this.cm_plots[country_data.country].push({'year': index, 'val': country_data.child_mortality});
                this.income_plots[country_data.country].push({'year': index, 'val': country_data.income});
            }

            // console.log(year_income.length)
            const reducer = (accumulator, currentValue) => accumulator + parseFloat(currentValue);
            let sum_cm = year_income.map(
                x => x.child_mortality
            ).reduce(reducer, 0)
            // console.log(sum_cm)

            this.cm_plots['average'].push({'year': index, 'val': (sum_cm / year_income.length).toFixed(2)})

            let sum_income = year_income.map(
                x => x.income
            ).reduce(reducer, 0)
            this.income_plots['average'].push({'year': index, 'val': (sum_income / year_income.length).toFixed(2)})
        }
        // console.log(this.average_childmortality);
        // console.log(this.average_income);

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
                    'country': prevState.country,
                    'year': 2040
                };
            }
            )
            return;
        }
        this.setState((prevState, prevProps) => {
            return {
                'country': prevState.country,
                'year': prevState.year + 1
            };
        }
        )
    }

    setyear(event)
    {
        clearInterval(this.timerID);
        this.timerID = null;
        this.setState(
            {
                'country': this.state.country,
                'year': event.target.value
            }
        );

    }

    setCurrentYear()
    {
        clearInterval(this.timerID);
        this.timerID = null;
        this.setState(
            {
                'country': this.state.country,
                'year': 2040
            }
        );
    }

    handleSelect(event)
    {
        this.setState(
            {
                'country': event.target.value,
                'year': this.state.year
            }
        );
    }

    render() {
        let all_options = Object.keys(this.cm_plots)
        var all_countries = all_options.filter(x => x != "average").sort()
        all_options = ["average"].concat(all_countries)
        return (
            <div>
                <form>
                    <label for="year">Please select a year: </label>
                    <input type="range" min={1800} max={2040} step={1} id="year" value={this.state.year} onInput={this.setyear} />
                    <output name="selected_year" id="selected_year">{this.state.year}</output>
                </form>

                {
                    this.timerID === null &&
                    (
                        <div>
                            <br></br>
                            <label> <b>Please select a Country: </b></label>
                            <select value={this.state.country} onChange={this.handleSelect}>
                                {

                                    all_options.map(
                                        (x) => { return (<option value={x}>{x}</option>); }
                                    )
                                }
                            </select>
                        </div>
                    )
                }

                <br></br>
                <div>
                    <button onClick = {this.setCurrentYear}>Display complete curve</button>
                    <button onClick = {() => this.props.resetFunc(this.props.sceneno)}>Restart this scene</button>
                </div>

                <div id='ttip'></div>

                <svg id='scatter' width={800} height={800} ref = {this.svgRef}>

                </svg>

            </div>
        )
    }
}

export default Chart
