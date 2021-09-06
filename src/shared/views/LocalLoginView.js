import React from 'react';
import Field from "../components/Field";
import HiddenField from "../components/HiddenField";
import Header from "../components/Header";
import ViewType from "../other/ViewType"
import PropTypes from "prop-types";
import {LocalLoginViewController} from "../../ViewController";


class LocalLoginView extends LocalLoginViewController {
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
                        buttonFunc={() => this.handleViewChange(ViewType.defaultLoginView)}/>
                <form id="submit-form">
                    <div className="container">
                        <Field text={"Password"} type={"password"} placeholder={"Enter Password"} name={"user-password"}
                               id={"user-password"}/>
                        <HiddenField
                            text={"Custom Location"} type={"file"} placeholder={"Custom Location"}
                            name={"user-file-location"} id={"user-file-location"}
                            helpDescription={"Enter custom location of passwords database"}
                            location={this.state.location}/>

                        <button id="submit-button" type="submit" onClick={this.submitLocalLogin}>Login</button>
                    </div>
                </form>
            </>
        );
    }

    submitLocalLogin = (e) => {
        let userPassword = document.getElementById('user-password');
        let userLocation = document.getElementById('hiddenField');
        if (userPassword.checkValidity() && userLocation.checkValidity()) {
            e.preventDefault();
            this.submitLogin(userPassword.value, userLocation.value)
        }
    }

    componentDidMount() {
        this.selectFile();
    }
}

LocalLoginView.propTypes = {
    componentName: PropTypes.string.isRequired,
    changeParentsActiveView: PropTypes.func.isRequired,
}

export default LocalLoginView;
