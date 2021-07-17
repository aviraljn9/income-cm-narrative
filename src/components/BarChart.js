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
        )

        let datafiltered2 = this.median_income.filter(
            x => x.year <= this.state.year
        )

        const scalex = d3.scaleLinear()
        .domain([1800,2040])
        .range([0,700])
        const scaley = d3.scaleLinear()
        .domain([0,y_domain])
        .range([300,0])

        const scaley_2 = d3.scaleLog()
        .domain([200,179000])
        .range([300,0])

        d3.select('#scatter').html("");
        d3.select('#scatter').append('g')
        .attr('transform','translate(50,50)')
        .selectAll('circle')
        .data(datafiltered)
        .enter()
        .append('circle')
        .attr('cx',function(d,i) { return scalex(d.year); })
        .attr('cy',function(d,i) { return scaley(d.median_val); })
        .attr('r',function(d,i) { return radius; })
        .attr('fill', function(d,i) {
            if (d.year > 2021) {
                return 'red';
            }
                return 'lightblue';
            }
        )
    
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

        d3.select('#scatter').append('g')
        .attr('transform','translate(50,450)')
        .selectAll('circle')
        .data(datafiltered2)
        .enter()
        .append('circle')
        .attr('cx',function(d,i) { return scalex(d.year); })
        .attr('cy',function(d,i) { return scaley_2(d.median_val); })
        .attr('r',function(d,i) { return radius; })
        .attr('fill', function(d,i) {
            if (d.year > 2021) {
                return 'red';
            }
                return 'lightblue';
            }
        )
    
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

    render() {
        return (
            <div>
                <form>
                    <label for="year">Please select a year: </label>
                    <input type="range" min={1800} max={2040} step={1} id="year" value={this.state.year} onInput={this.setyear} />
                    <output name="selected_year" id="selected_year">{this.state.year}</output>
                </form>

                <svg id='scatter' width={800} height={800} ref = {this.svgRef}>

                </svg>
            </div>
        )
    }
}

export default BarChart
