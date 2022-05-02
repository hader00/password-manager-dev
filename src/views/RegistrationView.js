import React from 'react';
import PMReactUtils from "../shared/other/PMReactUtils";
import PropTypes from "prop-types";
import validator from 'validator'
import {RegistrationViewController} from "../ViewController";
import {
    Box,
    Button,
    CircularProgress,
    FormControl,
    FormControlLabel,
    IconButton,
    Snackbar,
    Switch,
    TextField,
    Tooltip
} from "@material-ui/core";
import VisibilityIcon from "@material-ui/icons/Visibility";
import Alert from "@material-ui/lab/Alert";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import '../shared/App.css';
import AppBarHeader from "../shared/components/AppBarHeader";
import * as LANGUAGE from '../shared/other/language_en.js';

/**
 * Class RegistrationView
 * Provides fields for remote login and buttons for switching to registration view or local mode
 *
 * @param   loading                         loading animation after registration button is fired
 * @param   server                          server state for custom server
 * @param   email                           email state for registration
 * @param   password                        password state for registration
 * @param   confirmPassword                 confirm password state for registration
 * @param   firstName                       user's first name
 * @param   lastName                        user's last name
 * @param   passwordType                    password type state (text or password)
 * @param   confirmPasswordType             confirmation password type state (text or password)
 * @param   passwordError                   password error state
 * @param   passwordErrorText               password helper text in case of validation error
 * @param   confirmPasswordError            confirm password error state
 * @param   confirmPasswordErrorText        confirm password helper text in case of validation error
 * @param   serverError                     server error state
 * @param   serverHelperText                server helper text in case of validation error
 * @param   emailError                      e-mail error state
 * @param   emailHelperText                 e-mail helper text in case of validation error
 * @param   firstNameError                  first name error state
 * @param   lastNameError                   last name error state
 * @param   checked                         state for custom server field
 * @param   snackbarOpen                    popup open state
 */
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
            passwordType: "password",
            confirmPasswordType: "password",
            passwordError: false,
            passwordHelperText: "",
            confirmPasswordError: false,
            confirmPasswordHelperText: "",
            serverError: false,
            serverHelperText: "",
            emailError: false,
            emailHelperText: "",
            firstNameError: false,
            lastNameError: false,
            checked: false,
            snackbarOpen: false
        }
    }

    render() {
        return (
            <FormControl style={{display: "flex"}} onSubmit={this.submitRegistration}>
                <AppBarHeader text={LANGUAGE.REGISTRATION} handleViewChange={this.handleViewChange}/>
                <Box className="mT60dFlex">
                    <TextField fullWidth text={LANGUAGE.FIRST_NAME} type={"text"} label={LANGUAGE.ENTER_FIRST_NAME}
                               value={this.state.firstName}
                               name={"firstName"} id={"firstName"} onChange={this.onChange} required
                               error={this.state.firstNameError}/>
                </Box>
                <Box className="pT10">
                    <TextField fullWidth text={LANGUAGE.LAST_NAME} type={"text"} label={LANGUAGE.ENTER_LAST_NAME}
                               name={"lastName"}
                               value={this.state.lastName}
                               id={"lastName"} onChange={this.onChange} required error={this.state.lastNameError}/>
                </Box>
                <Box className="pT10">
                    <TextField fullWidth text={LANGUAGE.EMAIL} type={"email"} label={LANGUAGE.ENTER_EMAIL}
                               name={"email"}
                               value={this.state.email}
                               id={"email"} onChange={this.onChange} required error={this.state.emailError}
                               helperText={this.state.emailHelperText}/>
                </Box>
                <Box className="pT10">
                    <div className="m0dFlex">
                        <TextField fullWidth text={LANGUAGE.PASSWORD} type={this.state.passwordType}
                                   label={LANGUAGE.ENTER_PASSWORD}
                                   name={"password"} value={this.state.password}
                                   id={"password"} onChange={this.onChange} required error={this.state.passwordError}
                                   helperText={this.state.passwordHelperText}
                        />
                        {this.state.password?.length > 0 ?
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
                <Box className="pT10">
                    <div className="m0dFlex">
                        <TextField fullWidth text={LANGUAGE.CONFIRM_PASSWORD} type={this.state.confirmPasswordType}
                                   label={LANGUAGE.CONFIRM_PASSWORD}
                                   name={"confirmPassword"} id={"confirmPassword"}
                                   error={this.state.confirmPasswordError}
                                   helperText={this.state.confirmPasswordHelperText}
                                   value={this.state.confirmPassword}
                                   onChange={this.onChange} onKeyDown={async (e) => {
                            await this.onEnterPress(e)
                        }} required/>
                        {this.state.confirmPassword?.length > 0 ?
                            <Button
                                onClick={() => {
                                    this.togglePasswordType("confirmPasswordType")
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
                                    this.setState({server: PMReactUtils.EMPTY_STRING})
                                    this.setState({serverError: false})
                                    this.setState({serverHelperText: PMReactUtils.EMPTY_STRING})
                                }
                            }}
                            control={<Switch color="primary"/>}
                            label={
                                <Box className="dFlex dimgrayColor">
                                    <p>{LANGUAGE.CUSTOM_SERVER}</p>
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
                <div className="mT20"/>
                <Button color="primary" variant="contained" type="submit"
                        onClick={async (e) => {
                            await this.submitRegistration(e)
                        }}>
                    {LANGUAGE.REGISTER}
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
                    <Alert elevation={6} variant="filled" onClose={() => {
                        this.handleClose(null, "clickaway")
                    }} severity="error">{LANGUAGE.REGISTRATION_FAILED}</Alert>
                </Snackbar>
            </FormControl>
        );
    }


    /**
     * checkPassword function
     * validate if passwords fulfill required characteristics
     */
    checkPassword = (password) => {
        if (!validator.matches(password, PMReactUtils.PASSWORD_REGEX)) {
            this.setState({passwordError: true})
            this.setState({passwordHelperText: LANGUAGE.PASSWORD_MUST_BE})
            return true
        }
        return false
    }

    /**
     * checkConfirmPassword function
     * validate if confirmPassword equals password
     */
    checkConfirmPassword = (confirmPassword) => {
        let s = this.state
        if (s.password !== confirmPassword) {
            this.setState({passwordError: true})
            this.setState({confirmPasswordError: true})
            this.setState({confirmPasswordHelperText: LANGUAGE.PASSWORD_DONT_MATCH})
            return true
        }
        return false
    }

    /**
     * onChange function
     * with email, server and passwords validator
     */
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

    /**
     * onEnterPress function
     * performs action on enter key press
     *
     * @param   e   caller event
     */
    onEnterPress = async (e) => {
        if (e.keyCode === 13 && e.shiftKey === false) {
            e.preventDefault();
            await this.submitRegistration(e);
        }
    }

    /**
     * submitRegistration function
     * validates inputs and sends registration details to electron which performs registration on the server
     *
     * @param   e   caller event
     */
    submitRegistration = async (e) => {
        e.preventDefault();
        let s = this.state
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
        if (this.state.checked && this.state.server === "") {
            this.setState({serverError: true})
            return
        }
        if (!this.state.loading) {
            this.setState({loading: true});
            this.submitSubmitRegistration(s.server, s.email, s.password, s.confirmPassword, s.firstName, s.lastName)
        }
    }

    /**
     * sanitizeValidation function
     * remove field errors and helper-texts
     */
    sanitizeValidation = () => {
        this.setState({serverError: false})
        this.setState({emailError: false})
        this.setState({passwordError: false})
        this.setState({confirmPasswordError: false})
        this.setState({firstNameError: false})
        this.setState({lastNameError: false})
        this.setState({confirmPasswordHelperText: PMReactUtils.EMPTY_STRING})
        this.setState({passwordHelperText: PMReactUtils.EMPTY_STRING})
        this.setState({emailHelperText: PMReactUtils.EMPTY_STRING})
        this.setState({serverHelperText: PMReactUtils.EMPTY_STRING})

    }
}

RegistrationView.propTypes = {
    componentName: PropTypes.string.isRequired,
    changeParentsActiveView: PropTypes.func.isRequired,
}

export default RegistrationView;
