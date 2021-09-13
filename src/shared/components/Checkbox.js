import {Component} from "react";

export class Checkbox extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    render() {
        return (
            <div className="checkboxcontainer">
                {this.props.text} <input type="checkbox" name={this.props.name} value={this.props.name}
                                         onClick={(e) => {
                                             this.props.changeCheckbox(e);
                                         }} checked={this.props.value}/>
            </div>
        );
    }
}

export default Checkbox;