import React from 'react';
import ViewType from "../other/ViewType"
import PropTypes from "prop-types";
import HiddenField from "../components/HiddenField";
import {LocalRegistrationViewController} from "../../ViewController";
import {AppBar, Box, Button, FormControl, TextField, Toolbar, Typography} from "@material-ui/core";
import VisibilityIcon from "@material-ui/icons/Visibility";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";


class LocalRegistrationView extends LocalRegistrationViewController {
    constructor(props) {
        super(props);
        this.state = {
            location: "",
            passwordType: "password"
        }
    }

    render() {
        return (
            <FormControl id="submit-form" onSubmit={this.submitLocalRegistrationLogin}>
                <AppBar variant="fullWidth">
                    <Toolbar style={{justifyContent: "space-between"}}>
                        <div style={{left: "0", display: "flex", alignItems: "center"}}>
                            <Button
                                style={{marginRight: "10px", backgroundColor: "#007fff"}}
                                startIcon={<ArrowBackIosIcon/>}
                                color="primary" variant="contained"
                                onClick={() => this.handleViewChange(ViewType.defaultLoginView)}>Back</Button>
                            <Typography style={{fontWeight: "bold"}} variant="h5">Local Registration</Typography>
                        </div>
                    </Toolbar>
                </AppBar>

                <Box style={{paddingTop: "60px"}}>
                    <div style={{display: "flex", margin: 0}}>
                        <TextField fullWidth type={this.state.passwordType} label="Enter Password"
                                   id="password" name="password" onChange={this.onChange}
                                   value={this.state.password}/>
                        {this.state.password?.length > 0 ?
                            <Button
                                variant=""
                                onClick={() => {
                                    this.togglePasswordType("passwordType")
                                }}
                            ><VisibilityIcon/></Button>
                            :
                            <></>
                        }
                    </div>
                </Box>
                <HiddenField
                    text={"Custom Location"} type={"file"} placeholder={"Select Folder"}
                    name={"user-file-location"} id={"user-file-location"}
                    helpDescription={"Enter custom location of passwords database"}
                    location={this.state.location}/>
                <Button color="primary" variant="contained" style={{width: "45vh"}} id="submit-button" type="submit"
                        onClick={this.submitLocalRegistrationLogin}>Create
                    Database
                </Button>
            </FormControl>
        );
    }

    submitLocalRegistrationLogin = (e) => {
        let userPassword = document.getElementById('password');

        if (userPassword.checkValidity()) {
            e.preventDefault();
            this.submitRegistration(userPassword.value, this.state.location);
        }
    }

    togglePasswordType = (type) => {
        if (this.state[type] === "password") {
            this.setState({[type]: "text"})
        } else {
            this.setState({[type]: "password"})
        }
    }

    componentDidMount() {
        this.selectFolder();
    }

    onChange = (e) => {
        this.setState({[e.target.name]: e.target.value});
    }
}

LocalRegistrationView.propTypes = {
    componentName: PropTypes.string.isRequired,
    changeParentsActiveView: PropTypes.func.isRequired,
}

export default LocalRegistrationView;
