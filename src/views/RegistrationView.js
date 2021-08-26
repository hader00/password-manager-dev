import React, {Component} from 'react';
import Field from "../components/Field";
import HiddenField from "../components/HiddenField";
import ViewType from "../other/ViewType";
import Header from "../components/Header";
import PropTypes from "prop-types";

class RegistrationView extends Component {
    render() {
        return (
            <>
                <Header hStyle="back" buttonText="< Back" buttonFunc={() => this.handleViewChange(ViewType.defaultLoginView)}/>
                <form id="submit-form" onSubmit={this.submitRegistration}>
                    <div className="container">
                        <Field text={"First Name"} type={"text"} placeholder={"Enter First Name"} name={"user-first-name"} id={"user-first-name"}/>
                        <Field text={"Last Name"} type={"text"} placeholder={"Enter Last Name"} name={"user-last-name"} id={"user-last-name"}/>
                        <Field text={"Email"} type={"email"} placeholder={"Enter Email"} name={"user-email"} id={"user-email"}/>
                        <Field text={"Password"} type={"password"} placeholder={"Enter Password"} name={"user-password"} id={"user-password"}/>
                        <Field text={"Confirm Password"} type={"password"} placeholder={"Confirm Password"} name={"user-confirm-password"} id={"user-confirm-password"}/>
                        <HiddenField
                            text={"Custom Server"} type={"text"} placeholder={"Enter Server"} name={"user-server"} id={"user-server"}
                            helpDescription={"For enterprise login"}/>

                        <button id="submit-button" type="submit" >Register</button>
                    </div>
                    <div className="container">
                        <button type="button" className="cancel-btn" onClick={() => this.handleViewChange(ViewType.defaultLoginView)}>Cancel</button>
                    </div>
                </form>
            </>
        );
    }

    handleViewChange = (view) => {
        this.props.changeParentsActiveView(view);
    }

    submitRegistration = (e) => {
        let userFirstName = document.getElementById('user-first-name');
        let userLastName = document.getElementById('user-last-name');
        let userEmail = document.getElementById('user-email');
        let userPassword = document.getElementById('user-password');
        let userConfirmPassword = document.getElementById('user-confirm-password');
        let userServer = document.getElementById('user-server');
        //
        if (userFirstName.checkValidity() && userLastName.checkValidity() && userServer.checkValidity() &&
            userEmail.checkValidity() && userPassword.checkValidity() && userConfirmPassword.checkValidity()) {
            //
            e.preventDefault();
            //
            userServer = userServer.value
            userEmail = userEmail.value
            userPassword = userPassword.value
            userConfirmPassword = userConfirmPassword.value
            userFirstName = userFirstName.value
            userLastName = userLastName.value
            //
            window.electron.submitRegistration(userServer, userEmail, userPassword,
                userConfirmPassword, userFirstName, userLastName).then((result) => {
                if (result.remoteRegistrationSuccess === true) {
                    this.handleViewChange(ViewType.passwordListView);
                } else {
                    // todo ui warning
                }
            })
        }
    }


    componentDidMount() {
    }
}

RegistrationView.propTypes = {
    componentName: PropTypes.string.isRequired,
    changeParentsActiveView: PropTypes.func.isRequired,
}

export default RegistrationView;