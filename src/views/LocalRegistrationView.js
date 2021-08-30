import React, {Component} from 'react';
import Field from "../components/Field";
import Header from "../components/Header";
import ViewType from "../other/ViewType"
import PropTypes from "prop-types";
import HiddenField from "../components/HiddenField";

class LocalRegistrationView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            location: ""
        }
    }
    render() {
        return (
            <>
            <Header hStyle="back" buttonText="< Back" buttonFunc={() => this.changeParentsActiveView(ViewType.defaultLoginView)}/>
            <form id="submit-form">
                <div className="container">
                    <Field text={"Password"} type={"password"} placeholder={"Enter Password"} name={"user-password"} id={"user-password"}/>
                    <HiddenField
                        text={"Custom Location"} type={"file"} placeholder={"Custom Location"} name={"user-file-location"} id={"user-file-location"}
                        helpDescription={"Enter custom location of passwords database"} location={this.state.location}/>
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
            const location = this.state.location
            window.electron.localRegistration(password, location).then((result) => {
                if (result.localRegistrationSuccess === true) {
                    this.changeParentsActiveView(ViewType.passwordListView);
                } else {
                    console.log("Registration NOT successful");
                }
            });
        }
    }

    componentDidMount() {
        document.getElementById('hiddenField').addEventListener('click', () => {
            window.electron.selectFolder().then((result) => {
                // todo check validity and show selected file path
                if (result.validity === true) {
                    console.log(result)
                    // todo show success msg
                    this.setState({location: result.selectedFolder})
                } else {
                    // todo show warning
                }
            });
        })
    }
}

LocalRegistrationView.propTypes = {
    componentName: PropTypes.string.isRequired,
    changeParentsActiveView: PropTypes.func.isRequired,
}

export default LocalRegistrationView;
