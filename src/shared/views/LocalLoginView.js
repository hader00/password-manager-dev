import React from 'react';
import ViewType from "../other/ViewType"
import PropTypes from "prop-types";
import {LocalLoginViewController} from "../../ViewController";
import {
    AppBar,
    Box,
    Button,
    CircularProgress,
    FormControl,
    FormControlLabel,
    IconButton,
    Switch,
    TextField,
    Toolbar,
    Tooltip,
    Typography
} from "@material-ui/core";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import VisibilityIcon from "@material-ui/icons/Visibility";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";


class LocalLoginView extends LocalLoginViewController {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            location: "",
            locationError: false,
            password: "",
            passwordError: false,
            passwordHelperText: "",
            passwordType: "password",
            checked: false
        }
    }

    render() {
        return (
            <FormControl style={{display: "flex"}} onSubmit={this.submitLocalLogin}>
                <AppBar variant="fullWidth">
                    <Toolbar style={{justifyContent: "space-between"}}>
                        <div style={{left: "0", display: "flex", alignItems: "center"}}>
                            <Button
                                style={{marginRight: "10px", backgroundColor: "#007fff"}}
                                startIcon={<ArrowBackIosIcon/>}
                                color="primary" variant="contained"
                                onClick={() => this.handleViewChange(ViewType.defaultLoginView)}>Back</Button>
                            <Typography style={{fontWeight: "bold"}} variant="h5">Local Login</Typography>
                        </div>
                    </Toolbar>
                </AppBar>
                <Box style={{paddingTop: "60px", paddingBottom: "10px"}}>
                    <div style={{display: "flex", margin: 0}}>
                        <TextField style={{width: "95vw"}} type={this.state.passwordType} label="Enter Password"
                                   id="password" name="password" onChange={this.onChange}
                                   value={this.state.password} helperText={this.state.passwordHelperText}
                                   required error={this.state.passwordError}
                        />
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
                <Box style={{display: "block"}}>
                    <Box style={{display: "flex"}}>
                        <FormControlLabel
                            checked={this.state.checked}
                            value="start"
                            onChange={(e) => {
                                this.setState({checked: !this.state.checked})
                                if (this.state.checked) {
                                    this.setState({location: ""})
                                }
                            }}
                            control={<Switch color="primary"/>}
                            label={
                                <Box style={{display: "flex", color: "dimgray"}}>
                                    <p>{"Custom Location"}</p>
                                    <Tooltip title={"Choose custom location of the database"}>
                                        <IconButton aria-label="questionMark">
                                            <HelpOutlineIcon/>
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            }
                            labelPlacement="end"
                        />

                    </Box>
                    <Box hidden={!this.state.checked && this.state.location === ""} style={{paddingBottom: "10px"}}>
                        <div>
                            <Button
                                style={{marginBottom: "10px"}}
                                variant="contained"
                                component="label"
                            >
                                {this.state.location === "" ? "Select File" : "Change"}
                                <input id="hiddenField" type="file" name={"user-file-location"} hidden/>
                            </Button>
                            <label style={{
                                color: "gray",
                                paddingTop: "10px",
                                paddingBottom: "10px"
                            }}>{this.state.location}</label>
                            <div style={{marginTop: "10px"}}/>
                            <label style={{
                                color: "red",
                                paddingLeft: "10px"
                            }}>
                                {(this.state.location.slice(-3) !== ".db" && this.state.location !== "") ? "The file format does not seem right. Expected file format is: .db" : ""}</label>
                            <label style={{
                                color: "red",
                                paddingTop: "10px",
                                paddingBottom: "10px"
                            }}>{this.state.locationError ? "Please choose location for database" : ""}</label>
                        </div>
                    </Box>
                </Box>

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

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.location !== this.state.location) {
            this.setState({locationError: false})
        }
    }

    submitLocalLogin = async (e) => {
        e.preventDefault();
        this.sanitize()
        if (this.state.location === "" && this.state.checked) {
            this.setState({locationError: true})
            this.setState({loading: false});
        } else if (this.state.password.length === 0) {
            this.setState({loading: false});
            this.setState({passwordError: true});
            this.setState({passwordHelperText: "Please insert password"});
        } else {
            await this.submitLogin(this.state.password, this.state.location)
        }
    }

    sanitize = () => {
        this.setState({locationError: false})
        this.setState({passwordHelperText: ""})
        this.setState({passwordError: false})
    }

    componentDidMount() {
        this.selectFile();
        this.getDatabase();
    }

    onChange = (e) => {
        this.setState({[e.target.name]: e.target.value});
    }

    togglePasswordType = () => {
        if (this.state.passwordType === "password") {
            this.setState({passwordType: "text"})
        } else {
            this.setState({passwordType: "password"})
        }
    }
}

LocalLoginView.propTypes = {
    componentName: PropTypes.string.isRequired,
    changeParentsActiveView: PropTypes.func.isRequired,
}

export default LocalLoginView;
