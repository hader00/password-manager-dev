import React from 'react';
import Field from "../components/Field";
import HiddenField from "../components/HiddenField";
import ViewType from "../other/ViewType";
import PropTypes from "prop-types";
import {DefaultLoginViewController} from "../../ViewController";

class DefaultLoginView extends DefaultLoginViewController {
    constructor(props) {
        super(props);
        this.state = {
            saveEmail: false,
            email: ""
        };
    }


    render() {
        return (
            <form id="submit-form" onSubmit={this.submitLogin}>
                <div className="container">
                    <Field text={"Email"} type={"text"} placeholder={"Enter Email"} name={"email"}
                           id={"email"} value={this.state.email} onChange={this.onChange}/>
                    <Field text={"Password"} type={"password"} placeholder={"Enter Password"} name={"user-password"}
                           id={"user-password"}/>
                    <HiddenField
                        text={"Custom Server"} type={"text"} placeholder={"Enter Server"} name={"user-server"}
                        helpDescription={"For enterprise login"}/>

                    <button id="submit-button" type="submit">Login</button>
                    <label>
                        <input type="checkbox" name="saveEmail" onClick={this.onChangeCheckBox} checked={this.state.saveEmail}/> Remember email
                    </label>
                    <div className="container-flex">
                        <button className="create-account-btn" id="create-account-button" type="button"
                                onClick={() => this.popAndChangeView(ViewType.registrationView)}>Create
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

    componentDidMount() {
        this.getEmail();
    }

    onChange = (e) => {
        this.setState({[e.target.name]: e.target.value});
    }

    onChangeCheckBox = (e) => {
        const checked = e.target.checked;
        this.setState({[e.target.name]: checked})
    }


    handleLocalLoginViewChange = () => {
        this.dbExists();
    }

    submitLogin = async (e) => {
        let userEmail = document.getElementById('email');
        let userPassword = document.getElementById('user-password');
        let userServer = document.getElementById('hiddenField');

        if (userServer.checkValidity() && userEmail.checkValidity() && userPassword.checkValidity()) {
            e.preventDefault();
            this.submitSubmitLogin(userServer.value, userEmail.value, userPassword.value, this.state.saveEmail)
        }
    }
}


DefaultLoginView.propTypes = {
    componentName: PropTypes.string.isRequired,
    changeParentsActiveView: PropTypes.func.isRequired,
}


export default DefaultLoginView;
