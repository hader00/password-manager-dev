import React, {Component} from "react";
import PropTypes from "prop-types";

export class Header extends Component {
    render() {
        return (
            <header className="header">
                <button type="button" className="info-btn"
                        onClick={this.props.buttonFunc}>{this.props.buttonText}</button>
                {this.props.hStyle === "input" ?
                    <input type="text" id="search" placeholder="Search" onChange={this.props.onChange}/>
                    :
                    <label>{this.props.text}</label>}
            </header>
        )
    }
}

Header.propTypes = {
    buttonFunc: PropTypes.func.isRequired,
    buttonText: PropTypes.string.isRequired,
    hStyle: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    text: PropTypes.string.isRequired
}

export default Header;
