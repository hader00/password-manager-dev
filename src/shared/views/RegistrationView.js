import React from 'react';
import HiddenField from "../components/HiddenField";
import ViewType from "../other/ViewType";
import PropTypes from "prop-types";
import validator from 'validator'
import {RegistrationViewController} from "../../ViewController";
import {
    AppBar,
    Box,
    Button,
    CircularProgress,
    FormControl,
    Snackbar,
    TextField,
    Toolbar,
    Typography
} from "@material-ui/core";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import VisibilityIcon from "@material-ui/icons/Visibility";
import Alert from "@material-ui/lab/Alert";

class RegistrationView extends RegistrationViewController {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            server: "",
            email: "",
            password: "",
            confirmPassword: "",
            firstName: "",
            lastName: "",
            serverError: false,
            emailError: false,
            passwordError: false,
            confirmPasswordError: false,
            firstNameError: false,
            lastNameError: false,
            confirmPasswordHelperText: "",
            passwordHelperText: "",
            emailHelperText: "",
            serverHelperText: "",
            passwordType: "password",
            confirmPasswordType: "password",
            snackbarOpen: false
        }
    }

    render() {
        return (
            <FormControl style={{display: "flex"}} onSubmit={this.submitRegistration}>
                <AppBar variant="fullWidth">
                    <Toolbar style={{justifyContent: "space-between"}}>
                        <div style={{left: "0", display: "flex", alignItems: "center"}}>
                            <Button
                                style={{marginRight: "10px", backgroundColor: "#007fff"}}
                                startIcon={<ArrowBackIosIcon/>}
                                color="primary" variant="contained"
                                onClick={() => this.handleViewChange(ViewType.defaultLoginView)}>Back</Button>
                            <Typography style={{fontWeight: "bold"}} variant="h5">Registration</Typography>
                        </div>
                    </Toolbar>
                </AppBar>
                <Box style={{paddingTop: "60px"}}>
                    <TextField fullWidth text={"First Name"} type={"text"} label={"Enter First Name"}
                               value={this.state.firstName}
                               name={"firstName"} id={"firstName"} onChange={this.onChange} required
                               error={this.state.firstNameError}/>
                </Box>
                <Box style={{paddingTop: "10px"}}>
                    <TextField fullWidth text={"Last Name"} type={"text"} label={"Enter Last Name"} name={"lastName"}
                               value={this.state.lastName}
                               id={"lastName"} onChange={this.onChange} required error={this.state.lastNameError}/>
                </Box>
                <Box style={{paddingTop: "10px"}}>
                    <TextField fullWidth text={"Email"} type={"email"} label={"Enter Email"} name={"email"}
                               value={this.state.email}
                               id={"email"} onChange={this.onChange} required error={this.state.emailError}
                               helperText={this.state.emailHelperText}/>
                </Box>
                <Box style={{paddingTop: "10px"}}>
                    <div style={{display: "flex", margin: 0}}>
                        <TextField fullWidth text={"Password"} type={this.state.passwordType} label={"Enter Password"}
                                   name={"password"} value={this.state.password}
                                   id={"password"} onChange={this.onChange} required error={this.state.passwordError}
                                   helperText={this.state.passwordHelperText}
                        />
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
                <Box style={{paddingTop: "10px"}}>
                    <div style={{display: "flex", margin: 0}}>
                        <TextField fullWidth text={"Confirm Password"} type={this.state.confirmPasswordType}
                                   label={"Confirm Password"}
                                   name={"confirmPassword"} id={"confirmPassword"}
                                   error={this.state.confirmPasswordError}
                                   helperText={this.state.confirmPasswordHelperText}
                                   value={this.state.confirmPassword}
                                   onChange={this.onChange} onKeyDown={async (e) => {
                            await this.onEnterPress(e)
                        }} required/>
                        {this.state.confirmPassword?.length > 0 ?
                            <Button
                                variant=""
                                onClick={() => {
                                    this.togglePasswordType("confirmPasswordType")
                                }}
                            ><VisibilityIcon/></Button>
                            :
                            <></>
                        }
                    </div>
                </Box>
                <HiddenField
                    onChange={this.onChange} onKeyDown={this.onEnterPress}
                    text={"Custom Server"} type={"text"} placeholder={"Enter Server (https://localhost:6868)"}
                    name={"server"}
                    id={"server"}
                    helpDescription={"For enterprise login"}
                    helperText={this.state.serverHelperText}
                    error={this.state.serverError}/>
                <Button color="primary" variant="contained" type="submit"
                        onClick={async (e) => {
                            await this.submitRegistration(e)
                        }}>
                    Register
                    {this.state.loading ?
                        <CircularProgress
                            style={{marginLeft: "10px", color: "white"}}
                            size={20}
                        />
                        :
                        <></>
                    }
                </Button>
                <Snackbar open={this.state.snackbarOpen} autoHideDuration={6000} onClose={this.handleClose}>
                    <Alert elevation={6} variant="filled" onClose={this.handleClose} severity="error">Registration
                        failed, please check your credentials!</Alert>
                </Snackbar>
            </FormControl>
        );
    }

    onChange = async (e) => {
        this.setState({[e.target.name]: e.target.value});
        this.sanitizeValidation();
        if (e.target.name === "password") {
            this.checkPassword(e.target.value);
        }
        if (e.target.name === "email") {
            this.checkEmail(e.target.value);
        }
        if (e.target.name === "confirmPassword") {
            this.checkConfirmPassword(e.target.value);
        }
        if (e.target.name === "server") {
            await this.checkServer(e.target.value);
        }
    }

    togglePasswordType = (type) => {
        if (this.state[type] === "password") {
            this.setState({[type]: "text"})
        } else {
            this.setState({[type]: "password"})
        }
    }

    checkPassword = (password) => {
        if (!validator.matches(password, /(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[0-9])(?=.*?[!"#$%'()*+,-./:;<=>?@\[\\\]^_`{|}~]).{8,}/)) {
            this.setState({passwordError: true})
            this.setState({passwordHelperText: "Password must be at least 8 charters long and contain one number, one lowercase, one uppercase and one special character (!\"#$%'()*+,-./:;<=>?@[\\]^_`{|}~)!"})
            return true
        }
        return false
    }
    checkEmail = (email) => {
        if (!validator.isEmail(email)) {
            this.setState({emailError: true})
            this.setState({emailHelperText: "Enter valid email!"})
            return true
        }
        return false
    }

    checkServer = async (server) => {
        console.log(!validator.isEmpty(server))
        if (!validator.isEmpty(server)) {
            const available = await this.checkServerAvailability(server).then((res) => {
                return res
            });
            console.log("available => ", available)
            if (!available?.serverCheck) {
                this.setState({serverError: true})
                this.setState({serverHelperText: `Cannot connect to: ${server}, please check your address again. Add also "http" or "https" prefix.`})
            } else {
                this.setState({serverHelperText: `Connected. ${server} is available`})
            }
        }
    }

    handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        this.setState({snackbarOpen: true})
    }

    checkConfirmPassword = (confirmPassword) => {
        let s = this.state
        if (s.password !== confirmPassword) {
            this.setState({passwordError: true})
            this.setState({confirmPasswordError: true})
            this.setState({confirmPasswordHelperText: "Passwords doesn't match!"})
            return true
        }
        return false
    }

    onEnterPress = async (e) => {
        if (e.keyCode === 13 && e.shiftKey === false) {
            e.preventDefault();
            await this.submitRegistration(e);
        }
    }

    submitRegistration = async (e) => {
        e.preventDefault();
        let s = this.state
        console.log(s.server, s.email, s.password, s.confirmPassword, s.firstName, s.lastName)
        this.sanitizeValidation();
        if (s.email.length === 0 || s.password.length === 0 || s.confirmPassword.length === 0 || s.firstName.length === 0 || s.lastName.length === 0) {
            if (s.email.length === 0) {
                this.setState({emailError: true})
            }
            if (s.password.length === 0) {
                this.setState({passwordError: true})
            }
            if (s.confirmPassword.length === 0) {
                this.setState({confirmPasswordError: true})
            }
            if (s.firstName.length === 0) {
                this.setState({firstNameError: true})
            }
            if (s.lastName.length === 0) {
                this.setState({lastNameError: true})
            }
            this.checkPassword(this.state.password)
            this.checkEmail(this.state.email)
            this.checkConfirmPassword(this.state.confirmPassword)
            return
        }
        if (this.checkPassword(this.state.password) || this.checkEmail(this.state.email) || this.checkConfirmPassword(this.state.confirmPassword)) {
            return
        }
        if (!this.state.loading) {
            this.setState({loading: true});
            this.submitSubmitRegistration(s.server, s.email, s.password, s.confirmPassword, s.firstName, s.lastName)
        }
    }

    sanitizeValidation = () => {
        this.setState({serverError: false})
        this.setState({emailError: false})
        this.setState({passwordError: false})
        this.setState({confirmPasswordError: false})
        this.setState({firstNameError: false})
        this.setState({lastNameError: false})
        this.setState({confirmPasswordHelperText: ""})
        this.setState({passwordHelperText: ""})
        this.setState({emailHelperText: ""})
        this.setState({serverHelperText: ""})

    }


    componentDidMount() {
    }
}

RegistrationView.propTypes = {
    componentName: PropTypes.string.isRequired,
    changeParentsActiveView: PropTypes.func.isRequired,
}

export default RegistrationView;
