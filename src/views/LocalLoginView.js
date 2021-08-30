import React, {Component} from 'react';
import Field from "../components/Field";
import HiddenField from "../components/HiddenField";
import Header from "../components/Header";
import ViewType from "../other/ViewType"
import PropTypes from "prop-types";

class LocalLoginView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            location: ""
        }
    }

    render() {
        return (
            <>
            <Header hStyle="back" buttonText="< Back" buttonFunc={() => this.handleViewChange(ViewType.defaultLoginView)}/>
            <form id="submit-form">
                <div className="container">
                    <Field text={"Password"} type={"password"} placeholder={"Enter Password"} name={"user-password"} id={"user-password"}/>
                    <HiddenField
                        text={"Custom Location"} type={"file"} placeholder={"Custom Location"} name={"user-file-location"} id={"user-file-location"}
                        helpDescription={"Enter custom location of passwords database"} location={this.state.location}/>

                    <button id="submit-button" type="submit" onClick={this.submitLocalLogin}>Login</button>
                </div>
            </form>
            </>
        );
    }

    handleViewChange = (location) => {
        this.props.changeParentsActiveView(location);
    }

    submitLocalLogin = (e) => {
        e.preventDefault();
        let userPassword = document.getElementById('user-password');
        let userLocation = document.getElementById('hiddenField');
        console.log(userPassword, userLocation)
        if (userPassword.checkValidity() && userLocation.checkValidity()) {
            //e.preventDefault();
            let password = userPassword.value
            let location = userLocation.value
            window.electron.localLogin(password, location).then((result) => {
                if (result.localLoginSuccess === true) {
                    console.log("Login successful");
                    this.handleViewChange(ViewType.passwordListView);
                } else {
                    console.log("Login unsuccessful");
                }
            });
        }
    }

    componentDidMount() {
        document.getElementById('hiddenField').addEventListener('click', () => {
            window.electron.selectFile().then((result) => {
                // todo check validity and show selected file path
                if (result.validity === true) {
                    // todo show success msg
                    this.setState({location: result.selectedFile})
                } else {
                    // todo show warning
                }
            });
        })
    }
}

LocalLoginView.propTypes = {
    componentName: PropTypes.string.isRequired,
    changeParentsActiveView: PropTypes.func.isRequired,
}

export default LocalLoginView;
