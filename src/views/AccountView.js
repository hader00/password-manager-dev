import React from 'react';
import PMReactUtils from "../shared/other/PMReactUtils";
import PropTypes from "prop-types";
import '../shared/App.css';
import {AppBar, Box, Button, Select, TextField, Toolbar, Typography} from "@material-ui/core";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import {AccountViewController} from "../ViewController";
import * as LANGUAGE from '../shared/other/language_en.js';

/**
 * Class AccountView - account view
 * Provides options for logout, clipboard auto clear timeout and auto-logout timeout
 *
 * @param   time                        auto-logout timeout fetched from electron
 * @param   customTime                  auto-logout timeout selector, custom value
 * @param   clipboardTime               clipboard timeout fetched from electron
 * @param   customClipboardTime         clipboard timeout selector, custom value
 */
class AccountView extends AccountViewController {
    constructor(props) {
        super(props);
        this.state = {
            time: 0,
            customTime: 0,
            clipboardTime: 0,
            customClipboardTime: 0,
        };
    }


    render() {
        return (
            <Box fullwidth>
                <AppBar>
                    <Toolbar style={{justifyContent: "space-between"}}>
                        <div className="arrowButton">
                            <Button
                                style={{marginRight: "10px", backgroundColor: "#007fff"}}
                                startIcon={<ArrowBackIosIcon/>}
                                color="primary" variant="contained"
                                onClick={() => this.handleViewChange(PMReactUtils.ViewType.passwordListView)}>{LANGUAGE.BACK}</Button>
                            <Typography style={{fontWeight: "bold"}} variant="h5">{LANGUAGE.ACCOUNT}</Typography>
                        </div>
                    </Toolbar>
                </AppBar>
                <Box fullwidth style={{paddingTop: "80px"}}>
                    <Typography style={{fontWeight: "bold"}} variant="h5">{LANGUAGE.SECURITY}</Typography>
                    <div className="flexWithSpacing">
                        <div style={{paddingTop: "5px"}}>
                            <label htmlFor="time"><b>{LANGUAGE.VAULT_TIMEOUT + PMReactUtils.COLON}</b></label>
                        </div>
                        <div>
                            <Select
                                native
                                value={this.state.time}
                                name='time'
                                onChange={this.onChange}
                                inputProps={{
                                    name: 'time',
                                    id: 'time',
                                }}
                            >
                                <option value={-1}>{LANGUAGE.NEVER}</option>
                                <option value={1}>{"1 " + LANGUAGE.MINUTE}</option>
                                <option value={5}>{"5 " + LANGUAGE.MINUTES}</option>
                                <option value={10}>{"10 " + LANGUAGE.MINUTES}</option>
                                <option value={20}>{"20 " + LANGUAGE.MINUTES}</option>
                                <option value={0}>{LANGUAGE.CUSTOM}</option>
                            </Select>
                        </div>
                    </div>
                    {this.state.time === 0 || this.state.time === "0" ?
                        <div className="flexWithSpacing">
                            <div style={{paddingTop: "15px", paddingLeft: "15px"}}>
                                <label htmlFor="customClipboardTime">{LANGUAGE.MINUTES + PMReactUtils.COLON}</label>
                            </div>
                            <TextField value={this.state.customTime} id="customTime" variant="outlined"
                                       name="customTime" label="minutes" type={"number"} min={1} max={1024}
                                       onChange={this.onChange}/>
                        </div>
                        :
                        <></>
                    }
                    <div style={{paddingTop: "20px", display: "flex", justifyContent: "space-between"}}>
                        <div style={{paddingTop: "5px"}}>
                            <label
                                htmlFor="clipboardTime"><b>{LANGUAGE.CLEAR_CLIPBOARD + PMReactUtils.COLON}</b></label>
                        </div>
                        <div>
                            <Select
                                native
                                name='clipboardTime'
                                value={this.state.clipboardTime}
                                onChange={this.onChange}
                                inputProps={{
                                    name: 'clipboardTime',
                                    id: 'clipboardTime',
                                }}
                            >
                                <option value={-1}>{LANGUAGE.NEVER}</option>
                                <option value={10}>{"10 " + LANGUAGE.SECONDS}</option>
                                <option value={20}>{"20 " + LANGUAGE.SECONDS}</option>
                                <option value={0}>{LANGUAGE.CUSTOM}</option>
                            </Select>
                        </div>
                    </div>
                    {this.state.clipboardTime === 0 || this.state.clipboardTime === "0" ?
                        <div className="flexWithSpacing">
                            <div style={{paddingTop: "15px", paddingLeft: "15px"}}>
                                <label htmlFor="customClipboardTime">{LANGUAGE.SECONDS + PMReactUtils.COLON}</label>
                            </div>
                            <TextField value={this.state.customClipboardTime} id="customClipboardTime"
                                       variant="outlined" name="customClipboardTime" label="seconds" min={1} max={1024}
                                       type={"number"} onChange={this.onChange}/>
                        </div>
                        :
                        <></>
                    }
                </Box>
                <Typography style={{paddingTop: "20px", fontWeight: "bold"}} variant="h5">{LANGUAGE.LOGOUT}</Typography>
                <Button variant="contained" color="primary" onClick={() => {
                    this.handleViewChange(PMReactUtils.ViewType.defaultLoginView)
                }}>
                    Logout
                </Button>
            </Box>
        );
    }

    /**
     * componentDidMount function starts when the class is mounted.
     * Asks electron for stored timeouts
     */
    componentDidMount() {
        this.getDefaultSecurityFromElectron().then(r => {
            return r
        })
    }

    /**
     * componentDidUpdate function starts when states or props changes.
     *
     * When user changes any state call setDefaultSecurityFromElectron()
     *
     * @param   prevProps   prevProps - previous properties
     * @param   prevState   prevState - previous states
     * @param   snapshot    snapshot
     */
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.time !== this.state.time || prevState.customTime !== this.state.customTime
            || prevState.clipboardTime !== this.state.clipboardTime || prevState.customClipboardTime !== this.state.customClipboardTime) {
            this.setDefaultSecurityFromElectron();
        }
    }

    /**
     * handleViewChange function
     * Sends App class new view
     *
     * @param   location   new view
     */
    handleViewChange = (location) => {
        this.props.changeParentsActiveView(location);
    }

    /**
     * getDefaultSecurityFromElectron function
     * Asks electron for clipboard and auto-logout timeouts and sets them
     */
    getDefaultSecurityFromElectron = async () => {
        let result = await this.getDefaultSecurity()
        if (["-1", "10", "20"].indexOf(result.response.clearTimeout) !== -1) {
            this.setState({clipboardTime: result.response.clearTimeout})
        } else {
            this.setState({clipboardTime: 0})
            this.setState({customClipboardTime: parseInt(result.response.clearTimeout)})
        }
        if (["-1", "1", "5", "10", "20"].indexOf(result.response.logoutTimeout) !== -1) {
            this.setState({time: result.response.logoutTimeout})
        } else {
            this.setState({time: 0})
            this.setState({customTime: parseInt(result.response.logoutTimeout)})
        }
    }

    /**
     * setDefaultSecurityFromElectron function
     * Handles custom selected values and sends selected values to electron
     */
    setDefaultSecurityFromElectron = () => {
        let timeouts = {
            time: 0,
            clipboardTime: 0,
        }
        if (["-1", "10", "20"].indexOf(this.state.clipboardTime) !== -1) {
            timeouts['clipboardTime'] = this.state.clipboardTime
        } else {
            timeouts['clipboardTime'] = this.state.customClipboardTime
        }
        if (["-1", "1", "5", "10", "20"].indexOf(this.state.time) !== -1) {
            timeouts['time'] = this.state.time
        } else {
            timeouts['time'] = this.state.customTime
        }
        this.setDefaultSecurity(timeouts).then(r => {
            return r
        })
    }
}


AccountView.propTypes = {
    componentName: PropTypes.string.isRequired,
    changeParentsActiveView: PropTypes.func.isRequired,
}


export default AccountView;
