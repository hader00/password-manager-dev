import React, {Component} from 'react';
import Field from "../components/Field";
import HiddenField from "../components/HiddenField";
import ViewType from "../other/ViewType";
import PropTypes from "prop-types";

class DefaultLoginView extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <form id="submit-form" onSubmit={this.submitLogin}>
                <div className="container">
                    <Field text={"Email"} type={"text"} placeholder={"Enter Email"} name={"user-email"}
                           id={"user-email"}/>
                    <Field text={"Password"} type={"password"} placeholder={"Enter Password"} name={"user-password"}
                           id={"user-password"}/>
                    <HiddenField
                        text={"Custom Server"} type={"text"} placeholder={"Enter Server"} name={"user-server"}
                        helpDescription={"For enterprise login"}/>

                    <button id="submit-button" type="submit">Login</button>
                    <label>
                        <input type="checkbox" checked="checked" name="remember" onChange={() => {
                        }}/> Remember email
                    </label>
                    <div className="container-flex">
                        <button className="create-account-btn" id="create-account-button" type="button"
                                onClick={() => this.handleRegistrationViewChange(ViewType.registrationView)}>Create
                            Account
                        </button>
                        <button className="local-account-btn" id="local-login-button" type="button"
                                onClick={this.handleLocalLoginViewChange}>Local login
                        </button>
                    </div>
                </div>
            </form>
        );
    }

    handleRegistrationViewChange = (view) => {
        this.props.changeParentsActiveView(view);
    }


    handleLocalLoginViewChange = () => {
        // todo needs to be handled other way by saving previous user state (custom location etc)
        window.electron.dbExists().then((result) => {
            console.log(result)
            if (result.dbExists === true) {
                this.handleRegistrationViewChange(ViewType.localLoginView);
            } else {
                this.handleRegistrationViewChange(ViewType.localRegistrationView);
            }
        });
    }

    submitLogin = async (e) => {
        let userEmail = document.getElementById('user-email');
        let userPassword = document.getElementById('user-password');
        let userServer = document.getElementById('hiddenField');

        if (userServer.checkValidity() && userEmail.checkValidity() && userPassword.checkValidity()) {
            e.preventDefault();
            userServer = userServer.value
            userEmail = userEmail.value
            userPassword = userPassword.value
            window.electron.submitLogin(userServer, userEmail, userPassword).then((result) => {
                if (result.remoteLoginSuccess === true) {
                    this.handleRegistrationViewChange(ViewType.passwordListView);
                }
            })
        }
    }

    componentDidMount() {
    }
}


DefaultLoginView.propTypes = {
    componentName: PropTypes.string.isRequired,
    changeParentsActiveView: PropTypes.func.isRequired,
}


export default DefaultLoginView;
