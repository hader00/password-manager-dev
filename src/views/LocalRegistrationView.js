import React, {Component} from 'react';
import Field from "../components/Field";
import Header from "../components/Header";
import ViewType from "../other/ViewType"
import PropTypes from "prop-types";

class LocalRegistrationView extends Component {
    render() {
        return (
            <>
            <Header hStyle="back" buttonText="< Back" buttonFunc={() => this.changeParentsActiveView(ViewType.defaultLoginView)}/>
            <form id="submit-form">
                <div className="container">
                    <Field text={"Password"} type={"password"} placeholder={"Enter Password"} name={"user-password"} id={"user-password"}/>
                    <button id="submit-button" type="submit" onClick={this.submitLocalRegistrationLogin}>Create Database</button>
                </div>
            </form>
            </>
        );
    }

    changeParentsActiveView = (newActiveView) => {
        this.props.changeParentsActiveView(newActiveView);
    }


    submitLocalRegistrationLogin = (e) => {
        let userPassword = document.getElementById('user-password');

        if (userPassword.checkValidity()) {
            e.preventDefault();
            const password = userPassword.value
            window.electron.localRegistration(password).then((result) => {
                if (result.localRegistrationSuccess === true) {
                    this.changeParentsActiveView(ViewType.passwordListView);
                } else {
                    console.log("Registration NOT successful");
                }
            });
        }
    }
}

LocalRegistrationView.propTypes = {
    componentName: PropTypes.string.isRequired,
    changeParentsActiveView: PropTypes.func.isRequired,
}

export default LocalRegistrationView;
