import React, {Component} from 'react'
import PropTypes from 'prop-types';
import appLogo from '../../logo.svg';

const { URL } = require('url');


export class PasswordItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            url: this.props.password.Url
        }
    }
    render() {
        return (
            <div className="password-item">
                <div className="d-flex space-between">
                    <div>
                        <img id="password-icon" alt="" style={{width: "30px", height: "30px"}}
                             src={ this.imageExists(this.state.url) ? this.state.url : appLogo }
                        />
                    </div>
                    <div>
                        <p><b>{this.props.password.Title}</b></p>
                        <p>{this.props.password.Username}</p>
                    </div>
                    <div className="d-flex space-between">
                        <button className="small-btn" onClick={this.openPasswordEdit}>Edit</button>
                        <button className="small-btn" onClick={this.openPasswordView}>View</button>
                    </div>
                </div>
            </div>
        )
    };

    openPasswordEdit = () => {
        this.props.parentPasswordView(this.props.password.Id, false)
    }

    openPasswordView = () => {
        this.props.parentPasswordView(this.props.password.Id, true)
    }

    isURLValid = (s) => {
        try {
            new URL(s);
            return true;
        } catch (err) {
            return false;
        }
    };

    checkURL = () => {
        let url = this.state.url
        if (!this.state.url.startsWith('http')) {
            url = "https://".concat(url)
        }
        url = url.concat("/favicon.ico")
        this.setState({url: url})
    }

    imageExists(url){
        let image = new Image();
        image.src = url;
        if (!image.complete) {
            return false;
        }
        else if (image.height === 0) {
            return false;
        }
        return true;
    }

    componentDidMount() {
        this.checkURL();
    }
}

PasswordItem.propTypes = {
    password: PropTypes.object.isRequired,
    parentPasswordView: PropTypes.func.isRequired
}


export default PasswordItem;

