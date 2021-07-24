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
        this.setscene = this.setscene.bind(this);
        this.resetscene = this.resetscene.bind(this);
    }    

    setscene()
    {
        // clearInterval(this.timerID);
        // this.timerID = null;
        this.setState({'scene': (this.state.scene + 1) % 3, 'prevscene': (this.state.scene + 1) % 3});

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
                    <button onClick={this.setscene}>Change</button>
                    <Plot resetFunc = {this.resetscene} sceneno = {this.state.scene} />
                </div>
            )          
        } else if (this.state.scene == 1) {
            return (
                <div>
                    <button onClick={this.setscene}>Change</button>
                    <Chart resetFunc = {this.resetscene} sceneno = {this.state.scene} />
                </div>
            )
        }
        else if (this.state.scene == 2) {
            return (
                <div>
                    <button onClick={this.setscene}>Change</button>
                    <BarChart resetFunc = {this.resetscene} sceneno = {this.state.scene} />
                </div>
            )
        }
        else {
            return null;
        }
    }
}

export default Controller
