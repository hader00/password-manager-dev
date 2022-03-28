import React from 'react';
import ViewType from "../other/ViewType";
import PropTypes from "prop-types";
import {AppBar, Box, Button, Select, TextField, Toolbar, Typography} from "@material-ui/core";

import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import {AccountViewController} from "../../ViewController";

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
                <AppBar variant="fullWidth">
                    <Toolbar style={{justifyContent: "space-between"}}>
                        <div style={{left: "0", display: "flex", alignItems: "center"}}>
                            <Button
                                style={{marginRight: "10px", backgroundColor: "#007fff"}}
                                startIcon={<ArrowBackIosIcon/>}
                                color="primary" variant="contained"
                                onClick={() => this.handleViewChange(ViewType.passwordListView)}>Back</Button>
                            <Typography style={{fontWeight: "bold"}} variant="h5">Account</Typography>
                        </div>
                    </Toolbar>
                </AppBar>
                <Box fullwidth style={{paddingTop: "80px"}}>
                    <Typography style={{fontWeight: "bold"}} variant="h5">Security</Typography>
                    <div style={{display: "flex", justifyContent: "space-between"}}>
                        <div style={{paddingTop: "5px"}}>
                            <label htmlFor="time"><b>Vault Timeout:</b></label>
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
                                <option value={-1}>Never</option>
                                <option value={1}>1 minute</option>
                                <option value={5}>5 minutes</option>
                                <option value={10}>10 minutes</option>
                                <option value={20}>20 minutes</option>
                                <option value={0}>Custom</option>
                            </Select>
                        </div>
                    </div>
                    {this.state.time === 0 || this.state.time === "0" ?
                        <div style={{display: "flex", justifyContent: "space-between"}}>
                            <div style={{paddingTop: "15px", paddingLeft: "15px"}}>
                                <label htmlFor="customClipboardTime">minutes:</label>
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
                            <label htmlFor="clipboardTime"><b>Clear Clipboard:</b></label>
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
                                <option value={-1}>Never</option>
                                <option value={10}>10 seconds</option>
                                <option value={20}>20 seconds</option>
                                <option value={0}>Custom</option>
                            </Select>
                        </div>
                    </div>
                    {this.state.clipboardTime === 0 || this.state.clipboardTime === "0" ?
                        <div style={{display: "flex", justifyContent: "space-between"}}>
                            <div style={{paddingTop: "15px", paddingLeft: "15px"}}>
                                <label htmlFor="customClipboardTime">seconds:</label>
                            </div>
                            <TextField value={this.state.customClipboardTime} id="customClipboardTime"
                                       variant="outlined" name="customClipboardTime" label="seconds" min={1} max={1024}
                                       type={"number"} onChange={this.onChange}/>
                        </div>
                        :
                        <></>
                    }
                </Box>
                <Typography style={{paddingTop: "20px", fontWeight: "bold"}} variant="h5">Logout</Typography>
                <Button variant="contained" color="primary" onClick={() => {
                    this.handleViewChange(ViewType.defaultLoginView)
                }}>
                    Logout
                </Button>
            </Box>
        );
    }

    componentDidMount() {
        this.getDefaultSecurityFromElectron().then(r => {return r})
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.time !== this.state.time || prevState.customTime !== this.state.customTime
            || prevState.clipboardTime !== this.state.clipboardTime || prevState.customClipboardTime !== this.state.customClipboardTime) {
            this.setDefaultSecurityFromElectron();
        }
    }

    handleViewChange = (location) => {
        this.props.changeParentsActiveView(location);
    }

    onChange = (e) => {
        this.setState({[e.target.name]: e.target.value});
    };

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
        this.setDefaultSecurity(timeouts).then(r => {return r})
    }
}


AccountView.propTypes = {
    componentName: PropTypes.string.isRequired,
    changeParentsActiveView: PropTypes.func.isRequired,
}


export default AccountView;
