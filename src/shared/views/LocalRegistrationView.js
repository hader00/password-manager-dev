import React from 'react';
import Field from "../components/Field";
import Header from "../components/Header";
import ViewType from "../other/ViewType"
import PropTypes from "prop-types";
import HiddenField from "../components/HiddenField";
import {LocalRegistrationViewController} from "../../ViewController";


class LocalRegistrationView extends LocalRegistrationViewController {
    constructor(props) {
        super(props);
        this.state = {
            location: ""
        }
    }

    render() {
        return (
            <>
                <Header hStyle="back" buttonText="< Back"
                        buttonFunc={() => this.changeParentsActiveView(ViewType.defaultLoginView)}/>
                <form id="submit-form">
                    <div className="container">
                        <Field text={"Password"} type={"password"} placeholder={"Enter Password"} name={"user-password"}
                               id={"user-password"}/>
                        <HiddenField
                            text={"Custom Location"} type={"file"} placeholder={"Custom Location"}
                            name={"user-file-location"} id={"user-file-location"}
                            helpDescription={"Enter custom location of passwords database"}
                            location={this.state.location}/>
                        <button id="submit-button" type="submit" onClick={this.submitLocalRegistrationLogin}>Create
                            Database
                        </button>
                    </div>
                </form>
            </>
        );
    }

    submitLocalRegistrationLogin = (e) => {
        let userPassword = document.getElementById('user-password');

        if (userPassword.checkValidity()) {
            e.preventDefault();
            this.submitRegistration(userPassword.value, this.state.location);
        }
    }

    componentDidMount() {
        this.selectFolder();
    }
}

LocalRegistrationView.propTypes = {
    componentName: PropTypes.string.isRequired,
    changeParentsActiveView: PropTypes.func.isRequired,
}

export default LocalRegistrationView;
