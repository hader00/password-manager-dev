import React from 'react';
import PasswordItem from "../components/PasswordItem";
import PropTypes from "prop-types";
import ViewType from "../other/ViewType";
import {Add,} from "@material-ui/icons";
import ImportExportIcon from '@material-ui/icons/ImportExport';
import {AppBar, Box, Button, CircularProgress, Modal, TextField, Toolbar, Typography} from "@material-ui/core";
import {PasswordListViewController} from "../../ViewController";
import VisibilityIcon from "@material-ui/icons/Visibility";

export class PasswordListView extends PasswordListViewController {

    constructor(props) {
        super(props);
        this.state = {
            message: 'SELECT * FROM Passwords',
            searchInput: '',
            activePasswordID: 0,
            inputReadOnly: false,
            addingNewItem: false,
            open: false,
            exportLoading: false,
            location: "",
            password: "",
            email: "",
            passwordType: "password",
            passwordError: "",
            emailError: "",
            locationError: "",
            localMode: false,
            selectFolderLoaded: false,
        }
    }

    componentDidMount() {
        this.props.fetchAllPasswords();
        this.waitForLogout();
        this.waitForNewItem();
        this.waitForExportItems();
        this.getMode();
        this.selectFolder();
        this.waitForAccount();
    }

    waitForAccount = () => {
        window.electron.waitForAccount().then((result) => {
            this.props.changeParentsActiveView(ViewType.accountView)
        })
    }

    getMode = () => {
        window.electron.getMode().then((result) => {
            console.log("get mode result: ", result)
            this.setState({localMode: result.response === 0})
        })
    }

    waitForLogout = () => {
        window.electron.waitForLogout().then((result) => {
            this.props.changeParentsActiveView(ViewType.defaultLoginView)
        })
    }

    waitForNewItem = () => {
        window.electron.waitForNewItem().then((result) => {
            this.setState({addingNewItem: true});
        })
    }

    waitForExportItems = () => {
        window.electron.waitForExportItems().then((result) => {
            this.setState({open: true});
        })
    }

    componentDidUpdate(prevProps, prevState, _) {
        if (prevState.searchInput !== this.state.searchInput) {
            this.searchItems(this.state.searchInput);
        }
        this.selectFolder();
    }

    exportItems = () => {
        console.log("exporting items", this.state.password, this.state.location);
        window.electron.exportItems(this.state.password, this.state.email, this.state.location).then((result) => {
            if (result.response === true) {
                this.setState({open: false});
                this.setState({exportLoading: false});
                this.setState({location: ""})
                this.setState({password: ""})
                this.setState({email: ""})
                this.setState({locationError: ""})
                this.setState({passwordError: ""})
                this.setState({emailError: ""})
            } else {
                this.setState({emailError: "Error occurred, please check your email."})
                this.setState({passwordError: "Error occurred, please check your password."})
                this.setState({exportLoading: false})
            }
        });
    }

    onChange = (e) => {
        this.setState({[e.target.name]: e.target.value});
    }

    searchItems = () => {
        if (this.state.searchInput !== '') {
            const filteredData = this.props.passwords.filter((item) => {
                // Todo exclude password from values
                const {password, ...remaining} = item
                return Object.values(remaining).join('').toLowerCase().includes(this.state.searchInput?.toLowerCase())
            })
            this.props.setFilteredPasswords(filteredData)
        } else {
            this.props.setFilteredPasswords(this.state.passwords)
        }
    }

    handlePasswordView = (activePasswordVal, openTypeVal, addingNewItemVal) => {
        console.log(activePasswordVal, openTypeVal, addingNewItemVal);
        this.setState({activePasswordID: activePasswordVal});
        this.setState({inputReadOnly: openTypeVal});
        this.setState({addingNewItem: addingNewItemVal});
    }
    togglePasswordType = (type) => {
        if (this.state[type] === "password") {
            this.setState({[type]: "text"})
        } else {
            this.setState({[type]: "password"})
        }
    }

    render() {
        if (this.state.activePasswordID > 0 || this.state.addingNewItem === true) {
            this.props.setPasswordItem(
                {
                    password: this.props.passwords.length >= 1 ? this.props.passwords.filter(pass => pass.id === this.state.activePasswordID)[0] : [],
                    parentPasswordView: this.handlePasswordView,
                    inputReadOnly: this.state.inputReadOnly,
                    addingNewItem: this.state.addingNewItem
                });
            this.props.changeParentsActiveView(ViewType.passwordItem)
            return (<></>)
        } else {
            this.waitForExportItems();
            return (
                <>
                    <div className="container">
                        <AppBar variant="fullWidth">
                            <Toolbar style={{justifyContent: "space-between"}}>
                                <Button
                                    style={{marginRight: "10px", backgroundColor: "#007fff"}}
                                    color="primary" variant="contained"
                                    onClick={() => {
                                        this.setState({addingNewItem: true})
                                    }}>{<Add/>}</Button>
                                <TextField fullWidth
                                           style={{backgroundColor: "white", borderRadius: "10px"}}
                                           focused={true}
                                           value={this.state.searchInput} variant="outlined" type="text" id="search"
                                           size="small"
                                           placeholder="Search" onChange={(e) => {
                                    this.setState({passwordError: ""})
                                    this.setState({searchInput: e.target.value})
                                }
                                }/>
                            </Toolbar>
                        </AppBar>
                        <Box style={{paddingTop: "30px"}}>
                            <p id="no-items"> {(this.props.passwords.size === 0) ? "No Passwords" : ""}</p>
                            <div id="passwords">
                                {(this.state.searchInput?.length >= 1 && this.props.filteredPasswords?.length >= 1) ? (
                                    this.props.filteredPasswords?.map((password) => {
                                        return (
                                            <PasswordItem
                                                key={password.id}
                                                password={password}
                                                parentPasswordView={this.handlePasswordView}
                                            />
                                        )
                                    })
                                ) : (
                                    this.props.passwords?.length >= 1 ? (
                                        this.props.passwords?.map((password) => {
                                            return (
                                                <PasswordItem
                                                    key={password.id}
                                                    password={password}
                                                    parentPasswordView={this.handlePasswordView}
                                                />
                                            )
                                        })
                                    ) : (
                                        <></>
                                    )
                                )}
                            </div>
                        </Box>
                    </div>
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
                            <Typography style={{textAlign: "center"}} variant="h5">Please select location and insert
                                your credentials.</Typography>
                            <div style={{justifyContent: "center"}}>

                                <Button
                                    style={{marginBottom: "10px", marginTop: "10px"}}
                                    variant="contained"
                                    component="label"
                                >
                                    {this.state.location === "" ? "Select Folder" : "Change"}
                                    <input id="hiddenField" type="file" name={"user-file-location"} hidden/>
                                </Button>
                                <label style={{color: "gray", paddingLeft: "10px"}}>{this.state.location}</label>
                                <label style={{
                                    color: "red",
                                    paddingLeft: "10px"
                                }}>{this.state.location === "" ? this.state.locationError : ""}</label>
                                {this.state.localMode === false ?
                                    <TextField fullWidth type={"text"} label="Enter Email"
                                               id="email" name="email" onChange={(e) => {
                                        this.setState({emailError: ""})
                                        this.onChange(e)
                                    }} error={this.state.emailError}
                                               value={this.state.email} required
                                    />
                                    :
                                    <></>
                                }
                                <div style={{display: "flex", margin: 0, paddingBottom: "10px"}}>
                                    <TextField fullWidth type={this.state.passwordType} label="Enter Password"
                                               id="password" name="password" onChange={(e) => {
                                        this.setState({passwordError: ""});
                                        this.onChange(e);
                                    }}
                                               value={this.state.password} required error={this.state.passwordError}
                                    />
                                    {(this.state.password?.length > 0) ?
                                        <Button
                                            variant=""
                                            onClick={() => {
                                                this.togglePasswordType("passwordType")
                                            }}
                                        ><VisibilityIcon/></Button>
                                        :
                                        <></>
                                    }
                                </div>
                            </div>
                            <Button fullWidth style={{marginTop: "30px"}} color="secondary" className="cancel-btn"
                                    type="button"
                                    startIcon={<ImportExportIcon
                                        style={this.state.exportLoading ? {marginLeft: "10px"} : {}}/>}
                                    endIcon={this.state.exportLoading ? <CircularProgress
                                        style={{marginRight: "10px", color: "white"}}
                                        size={20}
                                        thickness={6}
                                    /> : <></>}
                                    variant="contained"
                                    onClick={async (e) => {
                                        if (this.state.password !== "" && this.state.location !== "") {
                                            if (this.state.email === "" && this.state.localMode === true) {
                                                this.setState({exportLoading: true});
                                                await this.exportItems(e);
                                            } else if (this.state.email !== "" && this.state.localMode === false) {
                                                this.setState({exportLoading: true});
                                                await this.exportItems(e);
                                            } else {
                                                this.setState({passwordError: this.state.password === "" ? "Please input password" : ""})
                                                this.setState({emailError: this.state.email === "" ? "Please input email" : ""})
                                                this.setState({locationError: this.state.location === "" ? "Please select folder" : ""})
                                            }
                                        } else {
                                            this.setState({passwordError: this.state.password === "" ? "Please input password" : ""})
                                            this.setState({emailError: this.state.email === "" ? "Please input email" : ""})
                                            this.setState({locationError: this.state.location === "" ? "Please select folder" : ""})
                                        }
                                    }

                                    }>Export
                            </Button>
                            <Button fullWidth style={{marginTop: "10px"}} color="primary"
                                    variant="contained"
                                    type="button" onClick={() => {
                                this.setState({open: false})
                                this.setState({location: ""})
                                this.setState({password: ""})
                                this.setState({email: ""})
                                this.setState({locationError: ""})
                                this.setState({passwordError: ""})
                                this.setState({emailError: ""})
                            }}>Cancel</Button>

                        </div>
                    </Modal>
                </>
            );
        }
    }
}


PasswordListView.propTypes = {
    componentName: PropTypes.string.isRequired,
    changeParentsActiveView: PropTypes.func.isRequired,
}

export default PasswordListView;
