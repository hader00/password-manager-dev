import React, {Component} from 'react'
import PropTypes from 'prop-types';
import appLogo from '../logo.svg';
import ImageWithDefault from "./ImageWithDefault";
import {Box, Button, Divider, Grid} from "@material-ui/core";


export class PasswordItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            url: this.props.password.url
        }
    }

    render() {
        return (
            <>
                <Box style={{paddingTop: "10px", paddingBottom: "10px", height: "60px", alignItems: "center"}}>
                    <Grid container style={{display: "flex", marginBottom: "10px", marginTop: "10px"}}>
                        <Grid item xs style={{display: "flex"}}>
                            <ImageWithDefault default={appLogo} src={this.state.url}
                                              style={{
                                                  paddingTop: "5px",
                                                  width: "30px",
                                                  height: "30px",
                                                  display: "flex"
                                              }}/>
                        </Grid>
                        <Grid item xs={10} style={{lineHeight: "0.1", marginTop: "-1vh"}}>
                            <p><b>{this.props.password.title}</b></p>
                            <p>{this.props.password.username}</p>
                        </Grid>
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
                    </Grid>
                </Box>
                <Divider variant="fullWidth"/>
            </>
        )
    };

    openPasswordEdit = () => {
        this.props.parentPasswordView(this.props.password.id, false)
    }

    openPasswordView = () => {
        this.props.parentPasswordView(this.props.password.id, true)
    }

    checkURL = () => {
        if (this.state.url !== "") {
            let url = this.state.url
            if (!this.state.url?.startsWith('http')) {
                url = "https://".concat(url)
            }
            url = url.concat("/favicon.ico")
            this.setState({url: url})
        }
    }

    componentDidMount() {
        this.checkURL();
    }
}

PasswordItem.propTypes = {
    password: PropTypes.object.isRequired,
    parentPasswordView: PropTypes.func.isRequired
}


export default PasswordItem;

