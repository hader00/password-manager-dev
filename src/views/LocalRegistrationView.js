import React from 'react';
import PMReactUtils from "../shared/other/PMReactUtils"
import PropTypes from "prop-types";
import {LocalRegistrationViewController} from "../ViewController";
import {Box, Button, FormControl, FormControlLabel, IconButton, Switch, TextField, Tooltip} from "@material-ui/core";
import VisibilityIcon from "@material-ui/icons/Visibility";
import * as LANGUAGE from '../shared/other/language_en.js';
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import validator from "validator";
import AppBarHeader from "../shared/components/AppBarHeader";

/**
 * Class LocalRegistrationView
 * Provides fields for local registration
 *
 * @param   loading                 loading animation after login button is fired
 * @param   location                path state for custom database
 * @param   locationError           location error for path state for custom database
 * @param   password                password state for login
 * @param   passwordType            password type state (text or password)
 * @param   passwordError           password error state
 * @param   passwordHelperText      password helper text in case of validation error
 * @param   createErrorHelperText   error text if creation fails
 * @param   checked                 state of custom location field for custom database
 */
class LocalRegistrationView extends LocalRegistrationViewController {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            location: "",
            locationError: false,
            password: "",
            passwordType: "password",
            passwordError: false,
            passwordHelperText: "",
            createErrorHelperText: "",
            checked: false
        }
    }

    render() {
        return (
            <FormControl style={{display: "flex"}} onSubmit={this.submitLocalRegistrationLogin}>
                <AppBarHeader text={LANGUAGE.LOCAL_REGISTRATION} handleViewChange={this.handleViewChange}/>
                <Box className="pT60 pB10">
                    <div className="m0dFlex">
                        <TextField className="defaultWidth" type={this.state.passwordType}
                                   label={LANGUAGE.ENTER_PASSWORD}
                                   id="password" name="password" onChange={(e) => {
                            this.onChange(e)
                            if (this.checkPassword(e.target.value)) {
                                this.setState({passwordError: true})
                                this.setState({passwordHelperText: LANGUAGE.PASSWORD_MUST_BE})
                            } else {
                                this.setState({passwordError: false})
                                this.setState({passwordHelperText: PMReactUtils.EMPTY_STRING})
                            }
                        }}
                                   value={this.state.password} error={this.state.passwordError}
                                   helperText={this.state.passwordHelperText}/>
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
                                    this.setState({location: ""})
                                }
                            }}
                            control={<Switch color="primary"/>}
                            label={
                                <Box className="dFlex dimgrayColor">
                                    <p>{LANGUAGE.CUSTOM_LOCATION}</p>
                                    <Tooltip title={LANGUAGE.CHOOSE_CUSTOM_DB}>
                                        <IconButton aria-label="questionMark">
                                            <HelpOutlineIcon/>
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            }
                            labelPlacement="end"
                        />

                    </Box>
                    <Box hidden={!this.state.checked && this.state.location === ""} className="pB10">
                        <div>
                            <Button
                                style={{marginBottom: "10px"}}
                                variant="contained"
                                component="label"
                            >
                                {this.state.location === "" ? LANGUAGE.SELECT_FOLDER : LANGUAGE.CHANGE}
                                <input id="hiddenField" type="file" name={"user-file-location"} hidden/>
                            </Button>
                            <div></div>
                            <div className="mT10"/>
                            <div className="wrapText">
                                <div className="limitText">
                                    <p className="grayColor pL10 pT10 pB10">{this.state.location}</p>
                                </div>
                                <div className="mT10"/>
                                <label
                                    className="grayColor pT10 pB10">{this.state.locationError ? LANGUAGE.CHOOSE_DB : PMReactUtils.EMPTY_STRING}</label>
                            </div>
                        </div>
                    </Box>
                </Box>
                <Button fullWidth color="primary" variant="contained" id="submit-button" type="submit"
                        onClick={async (e) => {
                            this.setState({loading: true});
                            await this.submitLocalRegistrationLogin(e)
                        }
                        }>{LANGUAGE.CREATE_DB}
                </Button>
                <div className="wrapText pT10">
                    <div className="limitText">
                        <label className="redColor ">{this.state.createErrorHelperText}</label>
                    </div>
                </div>
            </FormControl>
        );
    }

    /**
     * submitLocalRegistrationLogin function
     * Validates inputs and sends register details to electron which performs registrations locally
     *
     * @param   e   caller event
     */
    submitLocalRegistrationLogin = (e) => {
        e.preventDefault();
        this.sanitize()
        if (this.state.location === "" && this.state.checked) {
            this.setState({locationError: true})
        } else if (this.state.password === "") {
            this.setState({passwordError: true})
            this.setState({passwordHelperText: LANGUAGE.PASSWORD_MUST_BE})
        } else if (this.checkPassword(this.state.password)) {
            //
        } else {
            this.submitRegistration(this.state.password, this.state.location);
        }
    }

    /**
     * componentDidUpdate function starts when states or props changes.
     *
     * When user changes location (path to folder) remove error
     *
     * @param   prevProps   prevProps - previous properties
     * @param   prevState   prevState - previous states
     * @param   snapshot    snapshot
     */
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.location !== this.state.location) {
            this.setState({locationError: false})
            this.setState({createErrorHelperText: PMReactUtils.EMPTY_STRING})
        }
    }

    checkPassword = (password) => {
        if (!validator.matches(password, PMReactUtils.PASSWORD_REGEX)) {
            this.setState({passwordError: true})
            this.setState({passwordHelperText: LANGUAGE.PASSWORD_MUST_BE})
            return true
        }
        return false
    }

    /**
     * componentDidMount function starts when the class is mounted.
     * Prepare electron for folder selection dialog
     */
    componentDidMount() {
        this.selectFolder();
    }

    /**
     * sanitize function
     * remove field errors and helper-texts
     */
    sanitize = () => {
        this.setState({createErrorHelperText: PMReactUtils.EMPTY_STRING})
        this.setState({locationError: false})
        this.setState({passwordHelperText: PMReactUtils.EMPTY_STRING})
        this.setState({passwordError: false})
    }

}

LocalRegistrationView.propTypes = {
    componentName: PropTypes.string.isRequired,
    changeParentsActiveView: PropTypes.func.isRequired,
}

export default LocalRegistrationView;
