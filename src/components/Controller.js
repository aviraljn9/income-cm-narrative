import React, { Component } from 'react'
import Chart from './Chart.js';
import Plot from './Plot.js';
import BarChart from './BarChart.js';

export class Controller extends Component {
    constructor(props) {
        super(props);
        this.svgRef = React.createRef();

        this.state = {
            'scene': 0,
            'prevscene': 0
        }
        this.nextscene = this.nextscene.bind(this);
        this.resetscene = this.resetscene.bind(this);
    }    

    nextscene()
    {
        // clearInterval(this.timerID);
        // this.timerID = null;
        this.setState({'scene': (this.state.scene + 1) % 3, 'prevscene': (this.state.scene + 1) % 3});

    }

    setscene(x)
    {
        // clearInterval(this.timerID);
        // this.timerID = null;
        this.setState({'scene': x, 'prevscene': x});

    }

    resetscene(x)
    {
        console.log('resetting')
        console.log(x);
        this.setState({'scene': -1, 'prevscene': x});
    }

    componentDidUpdate()
    {
        if (this.state.scene == -1)
        {
            this.setState({'scene': this.state.prevscene, 'prevscene': this.state.prevscene});
        }
    }
    
    render() {
        if (this.state.scene == 0) {
            return (
                <div>
                    <button onClick={()=>this.setscene(0)}>Previous</button>
                    <button onClick={()=>this.resetscene(0)}>Scene 1</button>
                    <button onClick={()=>this.setscene(1)}>Scene 2</button>
                    <button onClick={()=>this.setscene(2)}>Scene 3</button>
                    <button onClick={()=>this.setscene(1)}>Next</button>
                    <h2>
                        Scene 1: Child mortality vs Income of Countries (Through the years)  
                    </h2>
                    <Plot resetFunc = {this.resetscene} sceneno = {this.state.scene} />
                    <p>Source: Free data from gapminder.org, CC-BY LICENSE</p>
                </div>
            )          
        } else if (this.state.scene == 1) {
            return (
                <div>
                    <button onClick={()=>this.setscene(0)}>Previous</button>
                    <button onClick={()=>this.setscene(0)}>Scene 1</button>
                    <button onClick={()=>this.resetscene(1)}>Scene 2</button>
                    <button onClick={()=>this.setscene(2)}>Scene 3</button>
                    <button onClick={()=>this.setscene(2)}>Next</button>
                    <h2>
                        Scene 2: Average Child Mortality (up) and Average Income (down) per year  
                    </h2>
                    <Chart resetFunc = {this.resetscene} sceneno = {this.state.scene} />
                    <p>Source: Free data from gapminder.org, CC-BY LICENSE</p>
                </div>
            )
        }
        else if (this.state.scene == 2) {
            return (
                <div>
                    <button onClick={()=>this.setscene(1)}>Previous</button>
                    <button onClick={()=>this.setscene(0)}>Scene 1</button>
                    <button onClick={()=>this.setscene(1)}>Scene 2</button>
                    <button onClick={()=>this.resetscene(2)}>Scene 3</button>
                    <button onClick={()=>this.setscene(2)}>Next</button>
                    <h2>
                        Scene 3: Distribution of average child mortality across country deciles by income (Through the years) 
                    </h2>
                    <BarChart resetFunc = {this.resetscene} sceneno = {this.state.scene} />
                    <p>Source: Free data from gapminder.org, CC-BY LICENSE</p>
                </div>
            )
        }
        else {
            return null;
        }
    }
}

export default Controller
