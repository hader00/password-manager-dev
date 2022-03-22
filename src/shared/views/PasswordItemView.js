import React from 'react'
import PropTypes from 'prop-types';
import {PasswordItemViewController} from "../../ViewController";
import PasswordField from "../components/PasswordField";
import PasswordGenerator from "../components/PasswordGenerator";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import CreateIcon from '@material-ui/icons/Create';
import DeleteIcon from '@material-ui/icons/Delete';
import {
    AppBar,
    Box,
    Button,
    CircularProgress,
    FormControl,
    IconButton,
    Modal,
    TextField,
    Toolbar,
    Typography
} from "@material-ui/core";

export class PasswordItemView extends PasswordItemViewController {

    static defaultProps = {
        password: {
            username: "",
            password: "",
            description: "",
            url: "",
            server: "",
        },
        open: false,
        updateLoading: false,
        deleteLoading: false,
        saveLoading: false,
        inputReadOnly: false
    }

    constructor(props) {
        super(props);
        this.state = {
            ...this.props.password,
            titleError: false,
            titleHelperText: "",
            generator: {
                length: 10,
                specialCharacters: true,
                numbers: true,
                lowerCase: true,
                upperCase: true,
            },
            showGenerator: false,
            passwordFiledFocused: false,
            inputReadOnly: this.props.inputReadOnly
        }
        console.log(this.props.password)
        console.log(this.props.inputReadOnly)
    }


    render() {
        return (
            <>
                <FormControl style={{display: "flex"}}>
                    <AppBar variant="fullWidth">
                        <Toolbar style={{justifyContent: "space-between"}}>
                            <div style={{left: "0"}}>
                                <Button
                                    style={{marginRight: "10px", backgroundColor: "#007fff"}}
                                    startIcon={<ArrowBackIosIcon/>}
                                    color="primary" variant="contained"
                                    onClick={this.popView}>Back</Button>
                            </div>
                            <div style={{display: "flex"}}>
                                <Typography style={{fontWeight: "bold"}}
                                            variant="h5">{(this.state.title === undefined || this.state.title === "") ? "New Item" : this.state.title}</Typography>
                            </div>
                            <div style={{right: "0"}}/>
                            <IconButton
                                edge="end"
                                color="inherit"
                                onClick={(e) => {
                                    if (this.state.inputReadOnly) {
                                        this.setState({inputReadOnly: false})
                                    } else {
                                        this.setState({open: true})
                                        //this.deletePassword(e);
                                    }
                                }}
                            >
                                {this.state.inputReadOnly ? <CreateIcon/> : <DeleteIcon/>}
                            </IconButton>
                        </Toolbar>
                    </AppBar>
                    <Box style={{paddingTop: "60px"}}>
                        <TextField inputProps={{
                            readOnly: Boolean(this.state.inputReadOnly),
                            disabled: Boolean(this.state.inputReadOnly),
                        }} fullWidth style={{marginTop: "10px"}} text={"Title"} value={this.state.title} type={"text"}
                                   label={"Title"}
                                   name={"title"} id={"title"} inputRequired={true}
                                   onChange={e => this.onChange(e)}
                                   helperText={this.state.titleHelperText}
                                   required
                                   error={this.state.titleError}
                        />
                        <TextField inputProps={{
                            readOnly: Boolean(this.state.inputReadOnly),
                            disabled: Boolean(this.state.inputReadOnly),
                        }}
                                   fullWidth style={{marginTop: "10px"}} text={"Username"} value={this.state.username}
                                   type={"text"}
                                   label={"Username"}
                                   name={"username"} id={"username"}
                                   inputRequired={true} onChange={e => {
                            this.onChange(e)
                        }}/>
                        <PasswordField fullWidth text={"Password"} value={this.state.password} type={"password"}
                                       togglePasswordGenerator={this.togglePasswordGenerator}
                                       showingGenerator={this.state.showGenerator}
                                       placeholder={"Password"} name={"password"} id={"password"}
                                       inputReadOnly={this.state.inputReadOnly} inputRequired={true}
                                       onChange={e => {
                                           this.onChange(e);
                                       }} showViewPassOptions={!this.props.addingNewItem}/>
                        {
                            (this.state.showGenerator) ?
                                <Box style={{
                                    display: "block",
                                    textAlign: "center",
                                    padding: "20px 10px",
                                    backgroundColor: "#E0E0E0",
                                    borderRadius: "15px 0px 15px 15px"
                                }}>
                                    <PasswordGenerator generator={this.state.generator} onChange={this.onChange}
                                                       setGeneratorState={this.onChangeGenerator}/>
                                    <Button fullWidth color="primary" className="submit-button" type="button"
                                            variant="contained"
                                            style={{display: "inline-block", margin: "0 auto"}}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                let gen = this.state.generator;
                                                this.generatePassword(gen.length, gen.specialCharacters, gen.numbers, gen.lowerCase, gen.upperCase)
                                            }}>{this.state.password === "" || this.state.password === undefined ? "Generate Password" : "Re-generate Password"}</Button>
                                </Box>
                                :
                                <></>
                        }
                        <TextField
                            inputProps={{
                                readOnly: Boolean(this.state.inputReadOnly),
                                disabled: Boolean(this.state.inputReadOnly),
                            }}
                            fullWidth style={{marginTop: "10px"}} multiline={true} text={"Description"}
                            value={this.state.description} type={"text"}
                            label={"Description"} name={"description"} id={"description"}
                            inputRequired={false}
                            onChange={e => this.onChange(e)}/>
                        <TextField
                            inputProps={{
                                readOnly: Boolean(this.state.inputReadOnly),
                                disabled: Boolean(this.state.inputReadOnly),
                            }}
                            fullWidth style={{marginTop: "10px"}} text={"Url"} value={this.state.url} type={"text"}
                            label={"URL"} name={"url"}
                            id={"url"} inputRequired={true}
                            onChange={e => this.onChange(e)}/>
                        <Box style={{paddingTop: "10px"}}>
                            {
                                (!this.state.inputReadOnly && !this.props.addingNewItem) ?
                                    <>
                                        <Button fullWidth style={{backgroundColor: "#007fff"}} color="primary"
                                                id="submit-button" type="button"
                                                variant="contained"
                                                onClick={(e) => {
                                                    this.updatePassword(e)
                                                }}>Update
                                            {this.state.updateLoading ?
                                                <CircularProgress
                                                    style={{marginLeft: "10px", color: "white"}}
                                                    size={20}
                                                />
                                                :
                                                <></>
                                            }</Button>
                                    </> :
                                    (!this.props.addingNewItem) ?
                                        <Button fullWidth style={{backgroundColor: "green"}} color="primary"
                                                variant="contained"
                                                onClick={this.openBrowser}>{"Visit page"}</Button> :
                                        <Button fullWidth color="primary" id="submit-button" type="submit"
                                                variant="contained"
                                                onClick={(e) => {
                                                    this.savePassword()
                                                }}>
                                            Save
                                            {this.state.saveLoading ?
                                                <CircularProgress
                                                    style={{marginLeft: "10px", color: "white"}}
                                                    size={20}
                                                />
                                                :
                                                <></>
                                            }
                                        </Button>
                            }
                        </Box>
                    </Box>
                </FormControl>
                <Modal
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    open={this.state.open}
                    onClose={() => {
                        this.setState({open: false})
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        width: "90vw",
                        backgroundColor: "white",
                        padding: "10px",
                        borderRadius: "15px"
                    }}>
                        <Typography style={{textAlign: "center"}} variant="h5">Do you want to permanently delete this
                            password?</Typography>
                        <div style={{display: "grid", justifyContent: "center"}}>
                            <div style={{display: "flex", paddingTop: "10px"}}>
                                <Button fullWidth style={{marginRight: "10px", marginTop: "10px"}} color="secondary"
                                        className="cancel-btn"
                                        type="button"
                                        startIcon={<DeleteIcon
                                            style={this.state.deleteLoading ? {marginLeft: "10px"} : {}}/>}
                                        endIcon={this.state.deleteLoading ? <CircularProgress
                                            style={{marginRight: "10px", color: "white"}}
                                            size={20}
                                            thickness={6}
                                        /> : <></>}
                                        variant="contained"
                                        onClick={async (e) => {
                                            await this.deletePassword(e)
                                        }}>Delete
                                </Button>
                                <Button fullWidth style={{marginLeft: "10px", marginTop: "10px"}} color="primary"
                                        variant="contained"
                                        type="button" onClick={() => {
                                    this.setState({open: false})
                                }}>Cancel</Button>
                            </div>
                        </div>
                    </div>
                </Modal>
            </>
        )
    };

    savePassword = () => {
        if (this.state.title?.length > 0) {
            this.addPassword();
        } else {
            this.toggleTitleError();
        }
    }

    onChange = (e) => {
        this.setState({[e.target.name]: e.target.value});
        if (e.target.name === "title" && e.target.value?.length > 0) {
            this.setState({titleError: false})
            this.setState({titleHelperText: ""})
        } else if (e.target.name === "title" && !(e.target.value?.length > 0)) {
            this.setState({titleError: true})
            this.setState({titleHelperText: "Please enter Title"})
        }
    }

    togglePasswordGenerator = () => {
        this.setState({showGenerator: !this.state.showGenerator})
    }
    toggleTitleError = () => {
        this.setState({titleError: !this.state.titleError})
        if (this.state.titleHelperText === "") {
            this.setState({titleHelperText: "Please enter Title"})
        } else {
            this.setState({titleHelperText: ""})
        }

    }
    onChangeGenerator = (name, value) => {
        const newGenerator = {...this.state.generator, [name]: value}
        this.setState({generator: newGenerator});
    }

    checkURL = () => {
        let url = this.state.url
        if (!this.state.url?.startsWith('http')) {
            url = "https://".concat(url)
        }
        this.setState({url: url})
    }

    openBrowser = async () => {
        console.log("shellOpenExternal")
        console.log(this.state.url)
        await window.electron.shellOpenExternal(this.state.url);
    }

    componentDidMount() {
        if (!this.props.addingNewItem) {
            if (this.state.url !== "" && this.state.url !== undefined) {
                this.checkURL();
            }
            if (this.state.password !== "" && this.state.password !== undefined) {
                this.decryptPassword(this.state.password).then(password => {
                    this.setState({password: password})
                });
            }
        }
        this.waitForSaveItem();
        this.waitForDeleteItem();
    }

    waitForSaveItem = () => {
        window.electron.waitForSaveItem().then((result) => {
            this.savePassword();
        })
    }

    waitForDeleteItem = () => {
        window.electron.waitForDeleteItem().then((result) => {
            this.setState({open: true})
        })
    }
}

PasswordItemView.propTypes = {
    password: PropTypes.object.isRequired,
    inputReadOnly: PropTypes.bool.isRequired,
}


export default PasswordItemView;

