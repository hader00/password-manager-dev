import React, {Component} from 'react'
import PropTypes from "prop-types";


export class FormFooter extends Component {
    render() {
        return (
            <div className="container">
                <button type="button" className="cancel-btn">{this.props.btnText}</button>
                <span className="psw">{this.props.text} <a href="#">{this.props.link}</a></span>
            </div>
        )
    }
}


FormFooter.propTypes = {
    btnText: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired
}

export default FormFooter;