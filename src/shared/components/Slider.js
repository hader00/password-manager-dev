import {Component} from "react";

export class Slider extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    render() {
        return (
            <div className="slidecontainer" style={{padding: "10px"}}>
                <input type="range" min="1" max="150" value={this.props.value} className="slider" name={this.props.name}
                       id={this.props.name} onChange={this.props.onChange}/>
                {this.props.value}
            </div>
        )
    }
}

export default Slider