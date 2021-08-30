import React, {Component} from 'react'
import PropTypes from "prop-types";


export class HiddenField extends Component {
    render() {
        return (
            <div>
                <div className="switch-content">
                    <div className="label-with-tooltip">
                        <label className="switch-label"><b>{this.props.text}</b></label>
                        <label className="label-with-tooltip-question-mark" data-toggle='tooltip'
                               title={this.props.helpDescription}>?</label>
                    </div>
                    <label className="switch">
                        <input type="checkbox" id="toggle-id" onChange={this.toggleServerInput}/>
                        <span className="slider round"/>
                    </label>
                </div>
                <input type={this.props.type} placeholder={this.props.placeholder} name={this.props.name}
                       style={{display: "none"}}
                       id="hiddenField"/>
                <p>{this.props.location}</p>
            </div>
        )
    }

    toggleServerInput = () => {
        let field = document.getElementById("hiddenField");
        if (field.style.display === "block") {
            field.style.display = "none";
        } else {
            field.style.display = "block";
        }
    }

    componentDidMount() {
    }

}


HiddenField.propTypes = {
    text: PropTypes.string.isRequired,
    helpDescription: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    placeholder: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
}


export default HiddenField;