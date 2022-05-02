import React from 'react';
import PMReactUtils from "../shared/other/PMReactUtils"
import PropTypes from "prop-types";
import {LocalLoginViewController} from "../ViewController";
import {
    Box,
    Button,
    CircularProgress,
    FormControl,
    FormControlLabel,
    IconButton,
    Switch,
    TextField,
    Tooltip,
} from "@material-ui/core";
import VisibilityIcon from "@material-ui/icons/Visibility";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import '../shared/App.css';
import * as LANGUAGE from '../shared/other/language_en.js';
import AppBarHeader from "../shared/components/AppBarHeader";


/**
 * Class LocalLoginView
 * Provides fields for local login
 *
 * @param   loading                 loading animation after login button is fired
 * @param   location                path state for custom database
 * @param   locationError           location error for path state for custom database
 * @param   password                password state for login
 * @param   passwordType            password type state (text or password)
 * @param   passwordError           password error state
 * @param   passwordHelperText      password helper text in case of validation error
 * @param   checked                 state of custom location field for custom database
 */
class LocalLoginView extends LocalLoginViewController {
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
            checked: false
        }
    }

    render() {
        return (
            <FormControl style={{display: "flex"}} onSubmit={this.submitLocalLogin}>
                <AppBarHeader text={LANGUAGE.LOCAL_LOGIN} handleViewChange={this.handleViewChange}/>
                <Box className="pT60 pB10">
                    <div className="m0dFlex">
                        <TextField className="defaultWidth" type={this.state.passwordType}
                                   label={LANGUAGE.ENTER_PASSWORD}
                                   id="password" name="password" onChange={this.onChange}
                                   value={this.state.password} helperText={this.state.passwordHelperText}
                                   required error={this.state.passwordError}
                        />
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
                                {this.state.location === "" ? LANGUAGE.SELECT_FILE : LANGUAGE.CHANGE}
                                <input id="hiddenField" type="file" name={"user-file-location"} hidden/>
                            </Button>
                            <div></div>
                            <div className="mT10"/>
                            <div className="wrapText">
                                <div className="limitText">
                                    <p className="grayColor pL10 pT10 pB10">{this.state.location}</p>
                                </div>
                                <label className="redColor pL10 ">
                                    {(this.state.location.slice(-3) !== ".db" && this.state.location !== "") ? LANGUAGE.FILE_NOT_RIGHT : PMReactUtils.EMPTY_STRING}</label>
                                <label className="redColor pL10">
                                    {(this.state.location.slice(-3) !== ".db" && this.state.location !== "") ? LANGUAGE.EXPECTED_FILE_FORMAT : PMReactUtils.EMPTY_STRING}</label>
                                <label
                                    className="redColor pT10 pB10">{this.state.locationError ? LANGUAGE.CHOOSE_DB : PMReactUtils.EMPTY_STRING}</label>
                            </div>
                        </div>
                    </Box>
                </Box>
                <div className="mT20"/>
                <Button color="primary" variant="contained" onClick={async (e) => {
                    this.setState({loading: true});
                    await this.submitLocalLogin(e)
                }}>
                    Login
                    {this.state.loading ?
                        <CircularProgress
                            style={{marginLeft: "10px", color: "white"}}
                            size={20}
                        />
                        :
                        <></>
                    }
                </Button>
            </FormControl>
        );
    }

    /**
     * componentDidUpdate function starts when states or props changes.
     *
     * When user changes location (path to file) remove error
     *
     * @param   prevProps   prevProps - previous properties
     * @param   prevState   prevState - previous states
     * @param   snapshot    snapshot
     */
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.location !== this.state.location) {
            this.setState({locationError: false})
        }
    }

    /**
     * submitLocalLogin function
     * Validates inputs and sends login details to electron which performs login locally
     *
     * @param   e   caller event
     */
    submitLocalLogin = async (e) => {
        e.preventDefault();
        this.sanitize()
        if (this.state.location === "" && this.state.checked) {
            this.setState({locationError: true})
            this.setState({loading: false});
        } else if (this.state.password.length === 0) {
            this.setState({loading: false});
            this.setState({passwordError: true});
            this.setState({passwordHelperText: LANGUAGE.PLEASE_INSERT_PASSWORD});
        } else {
            await this.submitLogin(this.state.password, this.state.location)
        }
    }

    /**
     * componentDidMount function starts when the class is mounted.
     * Prepare electron for file selection dialog
     * Fetch stored database path from electron
     */
    componentDidMount() {
        this.selectFile();
        this.getDatabase();
    }

    /**
     * sanitize function
     * remove field errors and helper-texts
     */
    sanitize = () => {
        this.setState({locationError: false})
        this.setState({passwordHelperText: PMReactUtils.EMPTY_STRING})
        this.setState({passwordError: false})
    }
}

LocalLoginView.propTypes = {
    componentName: PropTypes.string.isRequired,
    changeParentsActiveView: PropTypes.func.isRequired,
}

export default LocalLoginView;
