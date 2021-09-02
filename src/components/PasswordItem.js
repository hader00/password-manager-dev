import React, {Component} from 'react'
import PropTypes from 'prop-types';


export class PasswordItem extends Component {
    render() {
        return (
            <div className="password-item">
                <div className="d-flex space-between">
                    <div>
                        <img id="password-icon" alt="" style={{width:"30px", height:"30px"}}
                             src={(this.props.password.Url.startsWith('https://') || this.props.password.Url.startsWith('http://')) ? this.props.password.Url + '/favicon.ico' : "https://" + this.props.password.Url + '/favicon.ico'}/>
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
}

PasswordItem.propTypes = {
    password: PropTypes.object.isRequired,
    parentPasswordView: PropTypes.func.isRequired
}


export default PasswordItem;

