
import {Component} from "react";
import Slider from "./Slider";
import Checkbox from "./Checkbox";

export class PasswordGenerator extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <Slider name={"length"} onChange={this.changeSlider} value={this.props.generator.length}/>
                <Checkbox name={"specialCharacters"} text={"Special Characters"} changeCheckbox={this.changeCheckbox} value={this.props.generator.specialCharacters}/>
                <Checkbox name={"numbers"} text={"Numbers"} changeCheckbox={this.changeCheckbox} value={this.props.generator.numbers}/>
                <Checkbox name={"lowerCase"} text={"Lower Case"} changeCheckbox={this.changeCheckbox} value={this.props.generator.lowerCase}/>
                <Checkbox name={"upperCase"} text={"Upper Case"} changeCheckbox={this.changeCheckbox} value={this.props.generator.upperCase}/>
            </div>
        );
    }

    changeCheckbox = (e) => {
        const checked = e.target.checked;
        this.props.setGeneratorState(e.target.name, checked)
    }
    changeSlider = (e) => {
        const value = e.target.value;
        this.props.setGeneratorState(e.target.name, value)
    }
}



PasswordGenerator.propTypes = {
}


export default PasswordGenerator;