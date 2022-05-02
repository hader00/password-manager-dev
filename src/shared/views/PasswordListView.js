import React from 'react';
import PasswordItem from "../components/PasswordItem";
import PropTypes from "prop-types";
import PMReactUtils from "../other/PMReactUtils";
import {Add,} from "@material-ui/icons";
import ImportExportIcon from '@material-ui/icons/ImportExport';
import {AppBar, Box, Button, CircularProgress, Modal, TextField, Toolbar, Typography} from "@material-ui/core";
import {PasswordListViewController} from "../../ViewController";
import VisibilityIcon from "@material-ui/icons/Visibility";
import * as LANGUAGE from '../other/language_en.js';

/**
 * Class PasswordListView
 * This class provides view for all passwords
 *
 * @param   searchInput                 search field input state
 * @param   activePasswordID            id of active password item
 * @param   inputReadOnly               view mode property
 * @param   addingNewItem               add new password mode
 * @param   open                        open modal
 * @param   exportLoading               loading animation for export
 * @param   location                    location of exported file
 * @param   password                    password for account or local database
 * @param   email                       email for account
 * @param   passwordType                password type state (text or password)
 * @param   passwordError               password error state
 * @param   emailError                  email error state
 * @param   locationError               location error state
 * @param   localMode                   local mode boolean
 * @param   timer                       logout timer
 * @param   fetchTimer                  fetchTimer of new passwords from server
 *
 */
export class PasswordListView extends PasswordListViewController {

    constructor(props) {
        super(props);
        this.state = {
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
            timer: null,
            fetchTimer: null
        }
    }

    /**
     * componentDidMount function starts when the class is mounted.
     * setups menu listeners, gets current mode, get auto-logout time
     * set auto-logout timer, set auto-fetch timer
     */
    componentDidMount() {
        this.passwordListViewDidMount();
    }
    /**
     * componentDidUpdate function starts when states or props changes.
     *
     * When user searches among all passwords
     *
     * @param   prevProps   prevProps - previous properties
     * @param   prevState   prevState - previous states
     * @param   snapshot    snapshot
     */
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.searchInput !== this.state.searchInput) {
            this.searchItems(this.state.searchInput);
        }
    }

    /**
     * clearState function
     * reverts states to default
     */
    clearState = () => {
        this.setState({open: false});
        this.setState({exportLoading: false});
        this.setState({location: ""})
        this.setState({password: ""})
        this.setState({email: ""})
        this.setState({locationError: ""})
        this.setState({passwordError: ""})
        this.setState({emailError: ""})
    }

    /**
     * searchItems function
     * search handler for password list filtration
     */
    searchItems = () => {
        if (this.state.searchInput !== '') {
            const filteredData = this.props.passwords.filter((item) => {
                const {password, ...remaining} = item
                return Object.values(remaining).join('').toLowerCase().includes(this.state.searchInput?.toLowerCase())
            })
            this.props.setFilteredPasswords(filteredData)
        } else {
            this.props.setFilteredPasswords(this.state.passwords)
        }
    }

    /**
     * handlePasswordView function
     * open password view for select password item
     */
    handlePasswordView = (activePasswordVal, openTypeVal, addingNewItemVal) => {
        this.setState({activePasswordID: activePasswordVal});
        this.setState({inputReadOnly: openTypeVal});
        this.setState({addingNewItem: addingNewItemVal});
    }

    /**
     * autoFetch function
     * setup timer for password fetching
     */
    autoFetch = async () => {
        let fetchTimer = setTimeout(() => {
            this.props.fetchAllPasswords()
        }, 5000);
        this.setState({fetchTimer: fetchTimer})
    }

    render() {
        if (this.state.activePasswordID > 0 || this.state.addingNewItem === true) {
            if (this.clearTimers === 'function'){
                this.clearTimers();
            }
            this.props.setPasswordItem(
                {
                    password: this.props.passwords.length >= 1 ? this.props.passwords.filter(pass => pass.id === this.state.activePasswordID)[0] : [],
                    parentPasswordView: this.handlePasswordView,
                    inputReadOnly: this.state.inputReadOnly,
                    addingNewItem: this.state.addingNewItem
                });
            this.props.changeParentsActiveView(PMReactUtils.ViewType.passwordItem)
            return (<></>)
        } else {
            if (this.waitForExportItems === 'function'){
                this.waitForExportItems();
            }
            return (
                <>
                    <div className="container">
                        <AppBar>
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
                                           placeholder={LANGUAGE.SEARCH} onChange={(e) => {
                                    this.setState({passwordError: ""})
                                    this.setState({searchInput: e.target.value})
                                }
                                }/>
                            </Toolbar>
                        </AppBar>
                        <Box className="pT30">
                            <p id="no-items"> {(this.props.passwords.size === 0) ? LANGUAGE.NO_PASSWORDS : PMReactUtils.EMPTY_STRING}</p>
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
                                    this.state.searchInput === "" && this.props.passwords?.length >= 1 ? (
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
                        className="modalOuter"
                        open={this.state.open}
                        onClose={() => {
                            this.autoLogOut().then(r => {
                                return r
                            })
                            this.autoFetch().then(r => {
                                return r
                            })
                            this.setState({open: false})
                        }}
                    >
                        <div className="modalInner">
                            <Typography style={{textAlign: "center"}}
                                        variant="h5">{LANGUAGE.PLEASE_SELECT_LOCATION_AND_INSERT_CREDENTIALS}</Typography>
                            <div className="justifyCenter">
                                <Button
                                    style={{marginBottom: "10px", marginTop: "10px"}}
                                    variant="contained"
                                    component="label"
                                >
                                    {this.state.location === "" ? "Select Folder" : "Change"}
                                    <input id="hiddenField" type="file" name={"user-file-location"} hidden
                                           onClick={(e) => {
                                               e.preventDefault();
                                               this.selectFolderFromElectron();
                                           }}/>
                                </Button>
                                <div className="mT10"/>
                                <div className="wrapText pT10 pB10">
                                    <div className="limitText">
                                        <label className="grayColor">{this.state.location}</label>
                                    </div>
                                    <label
                                        className="redColor">{this.state.location === "" ? this.state.locationError : ""}</label>
                                </div>
                                {this.state.localMode === false ?
                                    <div className="m0dFlex pB10 pT10">
                                        <TextField fullWidth type={"text"} label="Enter Email"
                                                   id="email" name="email" onChange={(e) => {
                                            this.setState({emailError: ""})
                                            this.onChange(e)
                                        }} error={this.state.emailError}
                                                   value={this.state.email} required
                                        />
                                    </div>
                                    :
                                    <></>
                                }
                                <div className="m0dFlex pB10">
                                    <TextField fullWidth type={this.state.passwordType} label={LANGUAGE.ENTER_PASSWORD}
                                               id="password" name="password" onChange={(e) => {
                                        this.setState({passwordError: ""});
                                        this.onChange(e);
                                    }}
                                               value={this.state.password} required error={this.state.passwordError}
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
                                                this.sanitizeState()
                                            }
                                        } else {
                                            this.sanitizeState()
                                        }
                                    }

                                    }>{LANGUAGE.EXPORT}
                            </Button>
                            <Button fullWidth style={{marginTop: "10px"}} color="primary"
                                    variant="contained"
                                    type="button" onClick={() => {
                                this.clearState()
                            }}>{LANGUAGE.CANCEL}</Button>
                        </div>
                    </Modal>
                </>
            );
        }
    }

    sanitizeState = () => {
        this.setState({passwordError: this.state.password === "" ? LANGUAGE.PLEASE_INPUT_PASSWORD : PMReactUtils.EMPTY_STRING})
        this.setState({emailError: this.state.email === "" ? LANGUAGE.PLEASE_INPUT_EMAIL : PMReactUtils.EMPTY_STRING})
        this.setState({locationError: this.state.location === "" ? LANGUAGE.PLEASE_SELECT_FOLDER : PMReactUtils.EMPTY_STRING})
    }
}

PasswordListView.propTypes = {
    componentName: PropTypes.string.isRequired,
    changeParentsActiveView: PropTypes.func.isRequired,
}

export default PasswordListView;
