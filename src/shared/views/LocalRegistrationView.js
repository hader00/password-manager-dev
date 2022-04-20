import React from 'react';
import ViewType from "../other/ViewType"
import PropTypes from "prop-types";
import {LocalRegistrationViewController} from "../../ViewController";
import {
    AppBar,
    Box,
    Button,
    FormControl,
    FormControlLabel,
    IconButton,
    Switch,
    TextField,
    Toolbar,
    Tooltip,
    Typography
} from "@material-ui/core";
import VisibilityIcon from "@material-ui/icons/Visibility";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import validator from "validator";


class LocalRegistrationView extends LocalRegistrationViewController {
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
            <FormControl style={{display: "flex"}} onSubmit={this.submitLocalRegistrationLogin}>
                <AppBar variant="fullWidth">
                    <Toolbar style={{justifyContent: "space-between"}}>
                        <div style={{left: "0", display: "flex", alignItems: "center"}}>
                            <Button
                                style={{marginRight: "10px", backgroundColor: "#007fff"}}
                                startIcon={<ArrowBackIosIcon/>}
                                color="primary" variant="contained"
                                onClick={() => this.handleViewChange(ViewType.defaultLoginView)}>Back</Button>
                            <Typography style={{fontWeight: "bold"}} variant="h5">Local Registration</Typography>
                        </div>
                    </Toolbar>
                </AppBar>

                <Box style={{paddingTop: "60px", paddingBottom: "10px"}}>
                    <div style={{display: "flex", margin: 0}}>
                        <TextField style={{width: "95vw"}} type={this.state.passwordType} label="Enter Password"
                                   id="password" name="password" onChange={(e) => {
                            this.onChange(e)
                            if (this.checkPassword(e.target.value)) {
                                this.setState({passwordError: true})
                                this.setState({passwordHelperText: "Password must be at least 8 charters long and contain one number, one lowercase, one uppercase and one special character (!\"#$%'()*+,-./:;<=>?@[\\]^_`{|}~)!"})
                            } else {
                                this.setState({passwordError: false})
                                this.setState({passwordHelperText: ""})
                            }
                        }}
                                   value={this.state.password} error={this.state.passwordError}
                                   helperText={this.state.passwordHelperText}/>
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
                                {this.state.location === "" ? "Select Folder" : "Change"}
                                <input id="hiddenField" type="file" name={"user-file-location"} hidden/>
                            </Button>
                            <div></div>
                            <label style={{
                                color: "gray",
                                paddingTop: "10px",
                                paddingBottom: "10px"
                            }}>{this.state.location}</label>
                            <label style={{
                                color: "red",
                                paddingTop: "10px",
                                paddingBottom: "10px"
                            }}>{this.state.locationError ? "Please choose location for database" : ""}</label>
                        </div>
                    </Box>
                </Box>
                <Button fullWidth color="primary" variant="contained" id="submit-button" type="submit"
                        onClick={async (e) => {
                            this.setState({loading: true});
                            await this.submitLocalRegistrationLogin(e)
                        }
                        }>Create
                    Database
                </Button>
            </FormControl>
        );
    }

    submitLocalRegistrationLogin = (e) => {
        e.preventDefault();
        this.sanitize()
        if (this.state.location === "" && this.state.checked) {
            this.setState({locationError: true})
        } else if (this.state.password === "") {
            this.setState({passwordError: true})
            this.setState({passwordHelperText: "Password must be at least 8 charters long and contain one number, one lowercase, one uppercase and one special character (!\"#$%'()*+,-./:;<=>?@[\\]^_`{|}~)!"})
        } else if (this.checkPassword(this.state.password)) {

        } else {

            this.submitRegistration(this.state.password, this.state.location);
        }
    }

    sanitize = () => {
        this.setState({locationError: false})
        this.setState({passwordHelperText: ""})
        this.setState({passwordError: false})
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.location !== this.state.location) {
            this.setState({locationError: false})
        }
    }

    checkPassword = (password) => {
        if (!validator.matches(password, /(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[0-9])(?=.*?[!"#$%'()*+,-./:;<=>?@\[\\\]^_`{|}~]).{8,}/)) {
            this.setState({passwordError: true})
            this.setState({passwordHelperText: "Password must be at least 8 charters long and contain one number, one lowercase, one uppercase and one special character (!\"#$%'()*+,-./:;<=>?@[\\]^_`{|}~)!"})
            return true
        }
        return false
    }

    togglePasswordType = () => {
        if (this.state.passwordType === "password") {
            this.setState({passwordType: "text"})
        } else {
            this.setState({passwordType: "password"})
        }
    }

    componentDidMount() {
        this.selectFolder();
    }

    onChange = (e) => {
        this.setState({[e.target.name]: e.target.value});
    }
}

LocalRegistrationView.propTypes = {
    componentName: PropTypes.string.isRequired,
    changeParentsActiveView: PropTypes.func.isRequired,
}

export default LocalRegistrationView;
