import React from 'react';
import HiddenField from "../components/HiddenField";
import Header from "../components/Header";
import ViewType from "../other/ViewType"
import PropTypes from "prop-types";
import {LocalLoginViewController} from "../../ViewController";
import {
    AppBar,
    Box,
    Button,
    CircularProgress,
    Divider,
    FormControl, IconButton,
    TextField,
    Toolbar,
    Typography
} from "@material-ui/core";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import CreateIcon from "@material-ui/icons/Create";
import {Save} from "@material-ui/icons";


class LocalLoginView extends LocalLoginViewController {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            location: "",
            password: "",
            passwordError: false,
            passwordHelperText: ""
        }
    }

    render() {
        return (
            <FormControl style={{display: "flex"}} onSubmit={this.submitLocalLogin}>
                <AppBar variant="fullWidth">
                    <Toolbar style={{justifyContent: "space-between"}}>
                        <div style={{left:"0", display: "flex", alignItems: "center"}}>
                            <Button
                                style={{marginRight: "10px", backgroundColor: "#007fff"}}
                                startIcon={<ArrowBackIosIcon/>}
                                color="primary" variant="contained"
                                onClick={() => this.handleViewChange(ViewType.defaultLoginView)}>Back</Button>
                            <Typography style={{fontWeight: "bold"}} variant="h5">Local Login</Typography>
                        </div>
                    </Toolbar>
                </AppBar>
                <Box style={{paddingTop: "60px"}}>
                    <TextField fullWidth type="password" label="Enter Password" id="password" name="password"
                               onChange={this.onChange}
                               value={this.state.password} error={this.state.passwordError}
                    helperText={this.state.passwordHelperText} required/>
                </Box>
                <HiddenField
                    text={"Custom Location"} type={"file"} placeholder={"Custom Location"}
                    name={"user-file-location"} id={"user-file-location"}
                    helpDescription={"Enter custom location of passwords database"}
                    location={this.state.location}/>

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

    submitLocalLogin = async (e) => {
        e.preventDefault();
        if (this.state.password.length === 0) {
            this.setState({loading: false});
            this.setState({passwordError: true});
            this.setState({passwordHelperText: "Please insert password"});
        } else {
            await this.submitLogin(this.state.password, this.state.location)
        }
    }

    componentDidMount() {
        this.selectFile();
    }

    onChange = (e) => {
        this.setState({[e.target.name]: e.target.value});
    }
}

LocalLoginView.propTypes = {
    componentName: PropTypes.string.isRequired,
    changeParentsActiveView: PropTypes.func.isRequired,
}

export default LocalLoginView;
