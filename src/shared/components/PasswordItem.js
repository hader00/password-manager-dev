import React, {Component} from 'react'
import PropTypes from 'prop-types';
import appLogo from '../../logo.svg';
import ImageWithDefault from "./ImageWithDefault";


export class PasswordItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            url: this.props.password.url
        }
    }

    render() {
        return (
            <div className="password-item">
                <div className="d-flex space-between">
                    <div>
                        <ImageWithDefault default={appLogo} src={this.state.url}
                                          style={{width: "30px", height: "30px"}}/>
                    </div>
                    <div>
                        <p><b>{this.props.password.title}</b></p>
                        <p>{this.props.password.username}</p>
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
        this.props.parentPasswordView(this.props.password.id, false)
    }

    openPasswordView = () => {
        this.props.parentPasswordView(this.props.password.id, true)
    }

    checkURL = () => {
        let url = this.state.url
        if (!this.state.url.startsWith('http')) {
            url = "https://".concat(url)
        }
        url = url.concat("/favicon.ico")
        this.setState({url: url})
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

