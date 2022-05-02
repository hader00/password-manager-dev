import React from 'react'
import PropTypes from 'prop-types';
import appLogo from '../logo.svg';
import {Box, Button, Divider, Grid} from "@material-ui/core";
import PMReactUtils from "../other/PMReactUtils"
import {PasswordItemViewController} from "../../ViewController";
import './../App.css';


/**
 * Class PasswordItem
 * PasswordItem view, provides preview for password item in passwordListView
 *
 * Provides buttons for password viewing and editing
 */
export class PasswordItem extends PasswordItemViewController {
    constructor(props) {
        super(props);
        this.state = {
            url: this.props.password.url
        }
    }

    render() {
        return (
            <>
                <Box className="passwordItemHeader">
                    <Grid container className="flexWithMarginTB">
                        <Grid item xs className="dFlex">
                            <img
                                className="favImg"
                                src={!this.isEmpty(this.state.url) ? this.state.url : appLogo}
                                onError={({currentTarget}) => {
                                    currentTarget.onerror = null; // prevents looping
                                    currentTarget.src = appLogo;
                                }}
                                alt={"favicon"}/>
                        </Grid>
                        <Grid item xs={10} className="GridTextFix">
                            <p><b>{this.props.password.title}</b></p>
                            <p>{this.props.password.username}</p>
                        </Grid>
                        {this.props.setCurrentPasswordForFill === undefined ?
                            <Grid item xs
                                  style={{position: "absolute", right: "10px", marginTop: "-10px", paddingRight: "10px"}}>
                                <Button style={{
                                    display: "block",
                                    width: "10px",
                                    height: "30px",
                                    backgroundColor: "#007fff",
                                    marginBottom: "2px"
                                }} size="small" variant="contained" color="primary"
                                        onClick={this.openPasswordEdit}>Edit</Button>
                                <Button style={{display: "block", width: "10px", height: "30px", backgroundColor: "green"}}
                                        size="small" variant="contained" color="secondary"
                                        onClick={this.openPasswordView}>View</Button>
                            </Grid>
                            :
                            <Grid item xs style={{position: "absolute", right: "10px", paddingRight: "10px"}}>
                                <Button fullWidth style={{
                                    backgroundColor: "green", width: "10px",
                                    height: "30px"
                                }} color="primary"
                                        variant="contained" onClick={async (e) => {
                                    e.preventDefault();
                                    this.fillCredentials(this.props.password.url, this.props.password.username, this.state.decryptedPassword)
                                }}>Fill</Button>
                            </Grid>}
                    </Grid>
                </Box>
                <Divider variant="fullWidth"/>
            </>
        )
    };

    /**
     * openPasswordEdit function
     * Sets passwordItemView to editing mode
     */
    openPasswordEdit = () => {
        this.props.parentPasswordView(this.props.password.id, false)
    }


    /**
     * openPasswordEdit function
     * Sets passwordItemView to viewing mode
     */
    openPasswordView = () => {
        this.props.parentPasswordView(this.props.password.id, true)
    }

    /**
     * checkURL function
     * Handles URL provided by the password object, for "open browser"
     * and "favicon fetch" functionality, adds prefix the URL
     * if the users did not include it.
     */
    checkURL = () => {
        if (!this.isEmpty(this.state.url)) {
            let url = this.state.url
            if (!this.state.url?.startsWith(PMReactUtils.HTTP)) {
                url = `${PMReactUtils.HTTPS}${PMReactUtils.PREFIX}${url}`
            }
            url = `${url}${PMReactUtils.FAVICON}`
            this.setState({url: url})
        }
    }

    /**
     * componentDidMount function starts when the class is mounted.
     * Parses and handles URL
     */
    componentDidMount() {
        this.passwordItemDidMount()
    }
}

PasswordItem.propTypes = {
    password: PropTypes.object.isRequired,
    parentPasswordView: PropTypes.func.isRequired
}


export default PasswordItem;

