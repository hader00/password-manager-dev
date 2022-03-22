import React from 'react';
import HiddenField from "../components/HiddenField";
import ViewType from "../other/ViewType";
import PropTypes from "prop-types";
import {DefaultLoginViewController} from "../../ViewController";
import {
    AppBar,
    Box,
    Button,
    ButtonGroup,
    CircularProgress,
    FormControl,
    Snackbar,
    TextField,
    Toolbar,
    Typography
} from "@material-ui/core";
import VisibilityIcon from '@material-ui/icons/Visibility';
import Alert from '@material-ui/lab/Alert';
import {Help} from "@material-ui/icons";
import validator from "validator";

class DefaultLoginView extends DefaultLoginViewController {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            saveEmail: true,
            email: "",
            password: "",
            server: "",
            passwordType: "password",
            passwordError: false,
            emailError: false,
            serverError: false,
            serverHelperText: "",
            snackbarOpen: false
        };
    }


    render() {
        return (
            <Box style={{paddingTop: "10px", paddingBottom: "10px"}}>
                <AppBar variant="fullWidth">
                    <Toolbar style={{display: "flex", justifyContent: "center"}}>
                        <Typography style={{fontWeight: "bold"}} variant="h5">Password Manager</Typography>
                    </Toolbar>
                </AppBar>
                <FormControl style={{paddingTop: "60px", display: "flex"}} onSubmit={this.submitLogin}>
                    <TextField type="email" label="Enter Email" id="email" name="email" onChange={this.onChange}
                               value={this.state.email} required error={this.state.emailError} helperText={this.state.emailHelperText}/>
                    <Box style={{paddingTop: "10px", paddingBottom: "10px"}}>
                        <div style={{display: "flex", margin: 0}}>
                            <TextField style={{width: "95vw"}} type={this.state.passwordType} label="Enter Password"
                                       id="password" name="password" onChange={this.onChange}
                                       value={this.state.password} required error={this.state.passwordError}
                                       onKeyDown={this.onEnterPress}/>
                            {(this.state.password?.length > 0) ?
                                <Button
                                    variant=""
                                    onClick={this.togglePasswordType}
                                ><VisibilityIcon/></Button>
                                :
                                <></>
                            }

                        </div>
                    </Box>
                    <HiddenField
                        text={"Custom Server"} type={"text"} placeholder={"Enter Server (https://localhost:8686)"}
                        name={"server"}
                        helperText={this.state.serverHelperText}
                        error={this.state.serverError}
                        toggle={this.state.server !== ""}
                        value={this.state.server} onChange={this.onChange} onKeyDown={async (e) => {
                        await this.onEnterPress(e)
                        console.log(this.state.server)
                    }}
                        helpDescription={"For enterprise login"} icon={<Help/>}/>
                    <Button variant="contained" style={{marginBottom: "20px"}} id="submit" type="submit"
                            color="primary" onClick={async (e) => {
                                await this.submitLogin(e)
                    }}>Login
                        {this.state.loading ?
                            <CircularProgress
                                style={{marginLeft: "10px", color: "white"}}
                                size={20}
                            />
                            :
                            <></>
                        }</Button>
                    <ButtonGroup variant="contained" aria-label="contained primary button group"
                                 style={{padding: "10px"}}>
                        <Button color="primary" style={{width: "50vh"}}
                                onClick={() => this.popAndChangeView(ViewType.registrationView)}>Create
                            Account
                        </Button>
                        <Button color="secondary" style={{width: "50vh"}} onClick={this.handleLocalLoginViewChange}>Local
                            login</Button>
                    </ButtonGroup>
                </FormControl>
                <Snackbar open={this.state.snackbarOpen} autoHideDuration={6000} onClose={this.handleClose}>
                    <Alert elevation={6} variant="filled" onClose={this.handleClose} severity="error">Login failed, please check your credentials!</Alert>
                </Snackbar>
            </Box>
        );
    }

    componentDidMount() {
        this.getEmail();
        this.getServer();
    }

    handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        this.setState({snackbarOpen: false})
    }

    onChange = async (e) => {
        this.sanitizeValidation();
        this.setState({[e.target.name]: e.target.value});
        if (e.target.name === "email") {
            this.checkEmail(e.target.value)
        }
        if (e.target.name === "server") {
            await this.checkServer(e.target.value)
        }
    }


    sanitizeValidation = () => {
        this.setState({passwordError: false})
        this.setState({emailError: false})
        this.setState({emailHelperText: ""})
        this.setState({serverError: false})
        this.setState({serverHelperText: ""})
    }

    checkEmail = (email) => {
        if (!validator.isEmail(email)) {
            this.setState({emailError: true})
            this.setState({emailHelperText: "Enter valid email!"})
            return true
        }
        return false
    }

    onEnterPress = async (e) => {
        if (e.keyCode === 13 && e.shiftKey === false) {
            e.preventDefault();
            await this.submitLogin(e);
        }
    }

    onChangeCheckBox = (e) => {
        const checked = e.target.checked;
        this.setState({[e.target.name]: checked})
    }


    handleLocalLoginViewChange = () => {
        this.dbExists();
    }

    submitLogin = async (e) => {
        e.preventDefault()
        if (this.state.email.length === 0 || this.state.password.length === 0) {
            if (this.state.email.length === 0) {
                this.setState({emailError: true})
            }
            if (this.state.password.length === 0) {
                this.setState({passwordError: true})
            }
            this.setState({loading: false});
        } else if (!this.state.emailError && !this.state.passwordError && !this.state.serverError && !this.state.loading) {
            this.setState({loading: true});
            await this.submitSubmitLogin(this.state.server, this.state.email, this.state.password, this.state.saveEmail)
        }
    }

    checkServer = async (server) => {
        console.log(!validator.isEmpty(server))
        if (!validator.isEmpty(server)){
            const available = await this.checkServerAvailability(server).then((res) => {return res});
            console.log("available => ", available)
            if (!available?.serverCheck) {
                this.setState({serverError: true})
                this.setState({serverHelperText: `Cannot connect to: ${server}, please check your address again. Add also "http" or "https" prefix.`})
            } else {
                this.setState({serverHelperText: `Connected. ${server} is available`})
            }
        }
    }

    togglePasswordType = () => {
        if (this.state.passwordType === "password") {
            this.setState({passwordType: "text"})
        } else {
            this.setState({passwordType: "password"})
        }
    }
}


DefaultLoginView.propTypes = {
    componentName: PropTypes.string.isRequired,
    changeParentsActiveView: PropTypes.func.isRequired,
}


export default DefaultLoginView;
