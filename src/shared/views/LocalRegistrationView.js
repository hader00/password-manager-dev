import React from 'react';
import Header from "../components/Header";
import ViewType from "../other/ViewType"
import PropTypes from "prop-types";
import HiddenField from "../components/HiddenField";
import {LocalRegistrationViewController} from "../../ViewController";
import {Box, Button, FormControl, TextField} from "@material-ui/core";
import VisibilityIcon from "@material-ui/icons/Visibility";


class LocalRegistrationView extends LocalRegistrationViewController {
    constructor(props) {
        super(props);
        this.state = {
            location: ""
        }
    }

    render() {
        return (
            <Box style={{paddingTop: "10px", paddingBottom: "10px"}}>
                <FormControl id="submit-form" onSubmit={this.submitLocalRegistrationLogin}>
                    <Header hStyle="back" buttonText="Back"
                            buttonFunc={() => this.changeParentsActiveView(ViewType.defaultLoginView)}/>
                    <Box style={{paddingTop: "10px", paddingBottom: "10px"}}>
                        <div style={{display: "flex", margin: 0}}>
                            <TextField style={{width: "70vw"}} type={this.state.passwordType} label="Enter Password"
                                       id="password" name="password" onChange={this.onChange}
                                       value={this.state.password}/>
                            <Button
                                variant=""
                                onClick={this.togglePasswordType}
                            ><VisibilityIcon/></Button>
                        </div>
                    </Box>
                    <HiddenField
                        text={"Custom Location"} type={"file"} placeholder={"Custom Location"}
                        name={"user-file-location"} id={"user-file-location"}
                        helpDescription={"Enter custom location of passwords database"}
                        location={this.state.location}/>
                    <Button color="primary" variant="contained" style={{width: "45vh"}} id="submit-button" type="submit"
                            onClick={this.submitLocalRegistrationLogin}>Create
                        Database
                    </Button>
                </FormControl>
            </Box>
        );
    }

    submitLocalRegistrationLogin = (e) => {
        let userPassword = document.getElementById('password');

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
