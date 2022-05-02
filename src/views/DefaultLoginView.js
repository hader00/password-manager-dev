import React from 'react';
import PMReactUtils from "../shared/other/PMReactUtils";
import PropTypes from "prop-types";
import * as LANGUAGE from '../shared/other/language_en.js';
import {DefaultLoginViewController} from "../ViewController";
import {
    AppBar,
    Box,
    Button,
    ButtonGroup,
    CircularProgress,
    FormControl,
    FormControlLabel,
    IconButton,
    Snackbar,
    Switch,
    TextField,
    Toolbar,
    Tooltip,
    Typography
} from "@material-ui/core";
import VisibilityIcon from '@material-ui/icons/Visibility';
import Alert from '@material-ui/lab/Alert';
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import '../shared/App.css';

/**
 * Class DefaultLoginView
 * Provides fields for remote login and buttons for switching to registration view or local mode
 *
 * @param   loading                 loading animation after login button is fired
 * @param   server                  server state for custom server
 * @param   email                   email state for login
 * @param   saveEmail               remember email state //todo
 * @param   password                password state for login
 * @param   passwordType            password type state (text or password)
 * @param   passwordError           password error state
 * @param   emailError              e-mail error state
 * @param   emailHelperText         e-mail helper text in case of validation error
 * @param   serverError             server error state
 * @param   serverHelperText        server helper text in case of validation error
 * @param   checked                 state for custom server field
 * @param   snackbarOpen            popup open state
 */
class DefaultLoginView extends DefaultLoginViewController {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            server: "",
            email: "",
            saveEmail: true,
            password: "",
            passwordType: "password",
            passwordError: false,
            emailError: false,
            emailHelperText: "",
            serverError: false,
            serverHelperText: "",
            checked: false,
            snackbarOpen: false,
        };
    }


    render() {
        return (
            <Box className="pTB15">
                <AppBar className="pB60">
                    <Toolbar className="flexWithCenter">
                        <Typography style={{fontWeight: "bold"}} variant="h5">{LANGUAGE.PASSWORD_MANAGER}</Typography>
                    </Toolbar>
                </AppBar>
                <div className="mT60dFlex">
                    <FormControl onSubmit={this.submitLogin}>
                        <TextField type="email" label={LANGUAGE.ENTER_EMAIL} id="email" name="email"
                                   onChange={this.onChange}
                                   value={this.state.email} required error={this.state.emailError}
                                   helperText={this.state.emailHelperText}/>
                        <Box className="pTB15">
                            <div className="m0dFlex">
                                <TextField className="defaultWidth" type={this.state.passwordType}
                                           label={LANGUAGE.ENTER_PASSWORD}
                                           id="password" name="password" onChange={this.onChange}
                                           value={this.state.password} required error={this.state.passwordError}
                                           onKeyDown={this.onEnterPress}/>
                                {(this.state.password?.length > 0) ?
                                    <Button
                                        onClick={() => {
                                            this.togglePasswordType("passwordType")
                                        }}
                                    ><VisibilityIcon/></Button>
                                    :
                                    <></>
                                }

                            </div>
                        </Box>
                        <Box className="dBlock">
                            <Box className="dFlex">
                                <FormControlLabel
                                    checked={this.state.checked}
                                    value="start"
                                    onChange={() => {
                                        this.setState({checked: !this.state.checked})
                                        if (this.state.checked) {
                                            this.setState({server: ""})
                                            this.setState({serverError: false})
                                            this.setState({serverHelperText: ""})
                                        }
                                    }}
                                    control={<Switch color="primary"/>}
                                    label={
                                        <Box className="dFlex dimgrayColor">
                                            <p>{LANGUAGE.CUSTOM_SERVER}</p>
                                            <div></div>
                                            <Tooltip title={LANGUAGE.FOR_ENTERPRISE_LOGIN}>
                                                <IconButton aria-label="questionMark">
                                                    <HelpOutlineIcon/>
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    }
                                    labelPlacement="end"
                                />
                            </Box>
                        </Box>
                        <Box hidden={!this.state.checked} className="pB10">
                            <TextField id="hiddenField" type={"text"}
                                       value={this.state.server}
                                       onChange={async (e) => {
                                           await this.onChange(e)
                                       }
                                       }
                                       style={{display: "flex"}}
                                       label={LANGUAGE.ENTER_SERVER + PMReactUtils.SPACE + LANGUAGE.EXAMPLE_SERVER}
                                       name={"server"}
                                       error={this.state.serverError}
                                       helperText={this.state.serverHelperText}
                            />
                        </Box>
                        <div className="mT20">
                        </div>
                        <Button variant="contained" className="pT10 mB20" id="submit" type="submit"
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
                        <div className="mT20">
                        </div>
                        <ButtonGroup orientation="vertical">

                            <Button color="primary" variant="contained" className="p10"
                                    onClick={() => this.handleViewChange(PMReactUtils.ViewType.registrationView)}>{LANGUAGE.CREATE_ACCOUNT}
                            </Button>
                            <ButtonGroup variant="contained" aria-label="contained primary button group"
                                         className="p10">
                                <Button color="secondary" className="halfVH" onClick={() => {
                                    this.handleViewChange(PMReactUtils.ViewType.localRegistrationView)
                                }}>{LANGUAGE.LOCAL_REGISTRATION}</Button>
                                <Button color="secondary" className="halfVH" onClick={() => {
                                    this.handleViewChange(PMReactUtils.ViewType.localLoginView)
                                }}>{LANGUAGE.LOCAL_LOGIN}</Button>
                            </ButtonGroup>
                        </ButtonGroup>
                    </FormControl>
                </div>
                <Snackbar open={this.state.snackbarOpen} autoHideDuration={6000} onClose={this.handleClose}>
                    <Alert elevation={6} variant="filled" onClose={() => {
                        this.handleClose(null, "clickaway")
                    }} severity="error">{LANGUAGE.LOGIN_FAIL_ERROR}</Alert>
                </Snackbar>
            </Box>
        );
    }

    /**
     * componentDidMount function starts when the class is mounted.
     * Asks electron for stored email and server
     */
    componentDidMount() {
        this.getEmail();
        this.getServer();
    }

    /**
     * onChange function
     * with email and server validator
     */
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

    /**
     * onEnterPress function
     * performs action on enter key press
     *
     * @param   e   caller event
     */
    onEnterPress = async (e) => {
        if (e.keyCode === 13 && e.shiftKey === false) {
            e.preventDefault();
            await this.submitLogin(e);
        }
    }

    /**
     * submitLogin function
     * validates inputs and sends login details to electron which performs login on the server
     *
     * @param   e   caller event
     */
    submitLogin = async (e) => {
        e.preventDefault()
        if (this.state.checked && this.state.server === "") {
            this.setState({serverError: true})
            return
        }
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

    /**
     * sanitizeValidation function
     * remove field errors and helper-texts
     */
    sanitizeValidation = () => {
        this.setState({passwordError: false})
        this.setState({emailError: false})
        this.setState({emailHelperText: PMReactUtils.EMPTY_STRING})
        this.setState({serverError: false})
        this.setState({serverHelperText: PMReactUtils.EMPTY_STRING})
    }
}


DefaultLoginView.propTypes = {
    componentName: PropTypes.string.isRequired,
    changeParentsActiveView: PropTypes.func.isRequired,
}


export default DefaultLoginView;
