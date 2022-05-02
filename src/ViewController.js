import {Component} from "react";
import PMReactUtils from "./shared/other/PMReactUtils";
import validator from "validator";

/**
 * Class CustomComponent
 * custom component with global functions
 */
class CustomComponent extends Component {
    /**
     * default onChange function
     */
    onChange = (e) => {
        this.setState({[e.target.name]: e.target.value});
    };

    /**
     * togglePasswordType function
     * changes password field from "text" to "password" and vice-versa
     *
     * @param   name   password field name
     */
    togglePasswordType = (name) => {
        if (this.state[name] === "password") {
            this.setState({[name]: "text"})
        } else {
            this.setState({[name]: "password"})
        }
    }

    /**
     * handleViewChange function
     * change view in App class
     *
     * @param   location            view to be changed
     */
    handleViewChange = (location) => {
        this.props.changeParentsActiveView(location);
    }

    /**
     * isEmpty function
     * for all possible empty/null/undefined cases
     */
    isEmpty = (item) => {
        return item === "" || item === null || item === "null" || item === undefined || item === "undefined";
    }
}


/**
 * Class LoginAndRegistrationComponent
 * component with functions for local and registration classes
 */
class LoginAndRegistrationComponent extends CustomComponent {
    /**
     * checkServerAvailability function
     * checks if selected server is available
     *
     * @param   server            user's custom server
     */
    checkServerAvailability = async (server) => {
        return await window.electron.checkServerAvailability(server)
    }

    /**
     * checkEmail function
     * validate Email
     */
    checkEmail = (email) => {
        if (!validator.isEmail(email)) {
            this.setState({emailError: true})
            this.setState({emailHelperText: "Enter valid email!"})
            return true
        }
        return false
    }

    /**
     * handleClose function
     * closes popup (snackbar)
     */
    handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        this.setState({snackbarOpen: false})
    }

    /**
     * openSnackbar function
     * open popup (snackbar)
     */
    openSnackbar = () => {
        this.setState({snackbarOpen: true})
    }

    /**
     * checkServer function
     * checks if inserted server is valid and available
     */
    checkServer = async (server) => {
        if (!validator.isEmpty(server)) {
            const available = await this.checkServerAvailability(server).then((res) => {
                return res
            });
            if (!available?.serverCheck) {
                this.setState({serverError: true})
                this.setState({serverHelperText: `Cannot connect to: ${server}, please check your address again. Add also "http" or "https" prefix.`})
            } else {
                this.setState({serverHelperText: `Connected. ${server} is available`})
            }
        }
    }
}


/**
 * Class LocalLoginViewController
 * View Controller for LocalLoginView with electron binders
 */
class LocalLoginViewController extends LoginAndRegistrationComponent {
    /**
     * getDatabase function
     * get previously used database path
     */
    getDatabase = () => {
        window.electron.getDatabase().then((result) => {
            if (result.database !== "" && result.database !== null) {
                this.setState({location: result.database})
                this.setState({checked: true})
            }
        })
    }

    /**
     * selectFile function
     * add listener for system dialog which allows file choosing
     */
    selectFile = () => {
        document.getElementById('hiddenField').addEventListener('click', (e) => {
            e.preventDefault();
            window.electron.selectFile().then((result) => {
                this.setState({location: result.selectedFile})
            });
        })
    }

    /**
     * submitLogin function
     * submits login detail to electron
     *
     * @param   password            user's password
     * @param   location            user's custom database location (path)
     */
    submitLogin = (password, location) => {
        window.electron.localLogin(password, location).then((result) => {
            if (result.localLoginSuccess === true) {
                this.handleViewChange(PMReactUtils.ViewType.passwordListView);
            } else {
                this.setState({loading: false});
                this.setState({passwordError: true});
                this.setState({password: ""})
                this.setState({passwordHelperText: "Login failed, please try again."});
                this.setState({passwordError: true});
                this.setState({passwordHelperText: "Login failed, please try again."});
            }
        });
    }
}


/**
 * Class LocalRegistrationViewController
 * View Controller for LocalRegistrationView with electron binders
 */
class LocalRegistrationViewController extends CustomComponent {
    /**
     * selectFolder function
     * add listener for system dialog which allows folder choosing
     */
    selectFolder = () => {
        document.getElementById('hiddenField').addEventListener('click', (e) => {
            e.preventDefault();
            window.electron.selectFolder().then((result) => {
                this.setState({location: result.selectedFolder})
            });
        })
    }

    /**
     * submitRegistration function
     * submits registration detail to electron
     *
     * @param   password            user's password
     * @param   location            user's custom database location (path)
     */
    submitRegistration = (password, location) => {
        window.electron.localRegistration(password, location).then((result) => {
            if (result.localRegistrationSuccess === true) {
                this.props.changeParentsActiveView(PMReactUtils.ViewType.passwordListView);
            } else {
                this.setState({createErrorHelperText: "Database already exists in selected location, please login"})
            }
        });
    }
}


/**
 * Class DefaultLoginViewController
 * View Controller for DefaultLoginView with electron binders
 */
class DefaultLoginViewController extends LoginAndRegistrationComponent {
    /**
     * submitSubmitLogin function
     * submits login details to electron
     *
     * @param   userServer              user's custom server
     * @param   userEmail               user's email
     * @param   userPassword            user's password
     * @param   saveEmail               bool if save email //todo
     */
    submitSubmitLogin = (userServer, userEmail, userPassword, saveEmail) => {
        window.electron.submitLogin(userServer, userEmail, userPassword, saveEmail).then((result) => {
            if (result.remoteLoginSuccess === true) {
                this.setState({server: ""})
                this.handleViewChange(PMReactUtils.ViewType.passwordListView);
            } else {
                this.setState({loading: false});
                this.openSnackbar();
            }
        })
    }

    /**
     * getEmail function
     * get previously used email
     */
    getEmail = () => {
        window.electron.getEmail().then((result) => {
            if (result.email !== "") {
                this.setState({email: result.email})
                this.setState({saveEmail: true})
            }
        })
    }

    /**
     * getServer function
     * get previously used server
     */
    getServer = () => {
        window.electron.getServer().then(async (result) => {
            this.setState({server: result.server === "null" && result.server === null ? "" : result.server})
            this.setState({checked: result.server !== "null" && result.server !== null && result.server !== ""})
            await this.checkServer(result.server)
        })
    }
}


/**
 * Class PasswordItemViewController
 * View Controller for PasswordItemView with electron binders
 */
class PasswordItemViewController extends CustomComponent {
    /**
     * openBrowser function
     * Open browser tab with current password's URL
     */
    openBrowser = async () => {
        await this.shellOpenExternal(this.state.url);
    }
    /**
     * passwordItemDidMount function
     * start after mount of passwordItem class
     */
    passwordItemDidMount = () => {
        this.checkURL();
    }
    /**
     * passwordItemViewDidMount function
     * start after mount of passwordItem class
     */
    passwordItemViewDidMount = () => {
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
        this.waitForSaveItemFromElectron();
        this.waitForDeleteItemFromElectron();
    }
    /**
     * waitForSaveItemFromElectron function adds menu
     * listener for save of newly created password
     */
    waitForSaveItemFromElectron = () => {
        this.waitForSaveItem().then(() => {
            this.savePassword();
        })
    }

    /**
     * waitForDeleteItemFromElectron function adds menu
     * listener for deletion of currently opened password and
     * opens popup with approval
     */
    waitForDeleteItemFromElectron = () => {
        this.waitForDeleteItem().then(() => {
            this.setState({open: true})
        })
    }
    /**
     * decryptPassword function
     * decrypt currently opened password for password item
     *
     * @param   encryptedPassword              an encrypted password
     */
    decryptPassword = async (encryptedPassword) => {
        return await window.electron.decryptPassword(encryptedPassword).then(r => {
            return r.password
        })
    }

    /**
     * shellOpenExternal function
     * open browser with URL
     *
     * @param   url     password items url
     */
    shellOpenExternal = async (url) => {
        return await window.electron.shellOpenExternal(url);
    }

    /**
     * generatePassword function
     * get new generated password from electron
     *
     * @param  length  a number of desired length
     * @param  specialCharacters  a bool if special characters should be used
     * @param  numbers  a bool if special numbers should be used
     * @param  lowerCase  a bool if special lowercase letters should be used
     * @param  upperCase  a bool if special uppercase letters should be used
     */
    generatePassword = (length, specialCharacters, numbers, lowerCase, upperCase) => {
        window.electron.generatePassword(length, specialCharacters, numbers, lowerCase, upperCase).then((result) => {
            if (result.password.length > 0) {
                this.setState({password: result.password})
            }
        });
    }
    /**
     * addPassword function
     * send new password to electron to be encrypted and stored on server or in local database
     */
    addPassword = () => {
        if (!this.state.saveLoading) {
            if (!this.state.title?.length > 0) {
                this.toggleTitleError();
                return;
            }
            let title = this.state.title;
            let description = this.state.description;
            let url = this.state.url;
            let username = this.state.username;
            let password = this.state.password;
            this.setState({saveLoading: true});
            window.electron.addPassword(title, description, url, username, password).then((result) => {
                if (result.addSuccess === true) {
                    this.handleViewChange(PMReactUtils.ViewType.passwordListView)
                }
            });
        }
    }

    /**
     * updatePassword function
     * update existing password on server or in local database
     */
    updatePassword = () => {
        if (!this.state.updateLoading) {
            let id = this.state.id;
            let title = this.state.title;
            let description = this.state.description;
            let url = this.state.url;
            let username = this.state.username;
            let password = this.state.password;
            this.setState({updateLoading: true});
            window.electron.updatePassword(id, title, description, url, username, password).then((result) => {
                if (result.updateSuccess === true) {
                    this.handleViewChange(PMReactUtils.ViewType.passwordListView)
                }
            });
        }
    }

    /**
     * deletePassword function
     * delete existing password on server or in local database
     */
    deletePassword = () => {
        if (!this.state.deleteLoading) {
            let id = this.state.id;
            this.setState({deleteLoading: true});
            window.electron.deletePassword(id).then((result) => {
                if (result.deleteSuccess === true) {
                    this.handleViewChange(PMReactUtils.ViewType.passwordListView)
                }
            });
        }
    }

    /**
     * waitForSaveItem function
     * add listener for menu action (save password)
     */
    waitForSaveItem = async () => {
        return await window.electron.waitForSaveItem()
    }

    /**
     * waitForDeleteItem function
     * add listener for menu action (delete password)
     */
    waitForDeleteItem = async () => {
        return await window.electron.waitForDeleteItem()
    }
    //
    fillCredentials = (url, username, password) => {
        //
    }
}


/**
 * Class RegistrationViewController
 * View Controller for RegistrationView with electron binders
 */
class RegistrationViewController extends LoginAndRegistrationComponent {
    /**
     * submitSubmitRegistration function
     * submits registration details to electron
     *
     * @param   userServer              user's custom server
     * @param   userEmail               user's email
     * @param   userPassword            user's password
     * @param   userConfirmPassword     user's userConfirmPassword
     * @param   userFirstName           user's first name
     * @param   userLastName            user's last name
     */
    submitSubmitRegistration = (userServer, userEmail, userPassword,
                                userConfirmPassword, userFirstName, userLastName) => {
        window.electron.submitRegistration(userServer, userEmail, userPassword,
            userConfirmPassword, userFirstName, userLastName).then((result) => {
            if (result.remoteRegistrationSuccess === true) {
                this.handleViewChange(PMReactUtils.ViewType.passwordListView);
            } else {
                this.setState({loading: false});
                this.openSnackbar();
            }
        })
    }
}


/**
 * Class PasswordListViewController
 * View Controller for PasswordListView with electron binders
 */
class PasswordListViewController extends CustomComponent {
    /**
     * exportItems function
     * listener for menu export action button
     * open popup for export, validate credentials and export items to selected location
     */
    exportItems = () => {
        this.exportItemsFromElectron(this.state.password, this.state.email, this.state.location)
    }

    /**
     * passwordListViewDidMount function
     * operations for passwordlistview
     */
    passwordListViewDidMount = () => {
        this.props.fetchAllPasswords();
        this.waitForLogout();
        this.waitForNewItem();
        this.waitForExportItems();
        this.getMode();
        this.waitForAccountFromElectron();
        this.waitForImportMenu();
        this.autoLogOut().then(r => {
            return r
        })
        this.autoFetch().then(r => {
            return r
        })
    }

    /**
     * waitForImportMenu function
     * listener for menu import action button
     */
    waitForImportMenu = () => {
        this.waitForImportMenuFromElectron().then(() => {
            this.props.fetchAllPasswords()
        })
    }

    /**
     * getMode function
     * get current login mode (remote or local)
     */
    getMode = () => {
        this.getModeFromElectron()
    }

    /**
     * waitForLogout function
     * listener for menu logout action button
     * call logout function
     */
    waitForLogout = () => {
        this.waitForLogoutFromElectron()
    }

    /**
     * waitForNewItem function
     * listener for menu add action button
     * set view for new item
     */
    waitForNewItem = () => {
        this.waitForNewItemFromElectron()
    }

    /**
     * waitForExportItems function
     * listener for menu export action button
     * open popup for export
     */
    waitForExportItems = () => {
        this.waitForExportItemsFromElectron()
    }
    /**
     * waitForAccountFromElectron function
     * listener for menu account action button
     * disables timers for fetch and auto-logout if fired
     */
    waitForAccountFromElectron = () => {
        this.waitForAccount().then(() => {
            clearTimeout(this.state.timer)
            this.setState({timer: null})
            clearTimeout(this.state.fetchTimer)
            this.setState({fetchTimer: null})
            this.props.changeParentsActiveView(PMReactUtils.ViewType.accountView)
        })
    }
    /**
     * autoLogOut function
     * setup timer for auto logout fetched from electron
     */
    autoLogOut = async () => {
        let timeout = await this.getDefaultSecurityFromElectron()
        if (timeout === null) {
            timeout = 5 * 60 * 1000; // 5 minutes
        }
        if (timeout !== -1) {
            let timoutTimer = setTimeout(() => {
                this.logoutImmediate()
                this.props.changeParentsActiveView(PMReactUtils.ViewType.defaultLoginView)
            }, timeout);
            this.setState({timer: timoutTimer})
        }
    }
    /**
     * getModeFromElectron function
     * get current mode (remote or local)
     */
    getModeFromElectron = () => {
        window.electron.getMode().then((result) => {
            this.setState({localMode: result.response === 0})
        })
    }

    /**
     * waitForLogoutFromElectron function
     * add listener for menu action (logout)
     */
    waitForLogoutFromElectron = () => {
        window.electron.waitForLogout().then(() => {
            this.logoutImmediate()
            this.props.changeParentsActiveView(PMReactUtils.ViewType.defaultLoginView)
        })
    }

    /**
     * waitForNewItemFromElectron function
     * add listener for menu action (new password)
     */
    waitForNewItemFromElectron = () => {
        window.electron.waitForNewItem().then(() => {
            this.setState({addingNewItem: true});
        })
    }

    /**
     * waitForExportItemsFromElectron function
     * add listener for menu action (export passwords)
     */
    waitForExportItemsFromElectron = () => {
        window.electron.waitForExportItems().then(() => {
            this.clearTimers();
            this.setState({open: true});
        })
    }

    clearTimers = () => {
        if (this.state.timer !== null) {
            clearTimeout(this.state.timer)
            this.setState({timer: null})
        }
        if (this.state.fetchTimer !== null) {
            clearTimeout(this.state.fetchTimer)
            this.setState({fetchTimer: null})
        }
    }

    /**
     * exportItemsFromElectron function
     * export passwords by electron
     *
     * @param   password           user's password
     * @param   email              user's email
     * @param   location           user's exported database location
     */
    exportItemsFromElectron = (password, email, location) => {
        window.electron.exportItems(password, email, location).then((result) => {
            if (result.response === true) {
                this.clearState()
            } else {
                this.setState({emailError: "Error occurred, please check your email."})
                this.setState({passwordError: "Error occurred, please check your password."})
                this.setState({exportLoading: false})
            }
        });
    }

    /**
     * getDefaultSecurityFromElectron function
     * get stored default logout timeouts
     */
    getDefaultSecurityFromElectron = async () => {
        return await window.electron.getDefaultSecurity().then((result) => {
            return parseInt(result?.response?.logoutTimeout) * 60 * 1000;
        })
    }

    /**
     * selectFolderFromElectron function
     * add listener for system dialog which allows file choosing
     */
    selectFolderFromElectron = () => {
        window.electron.selectFolder().then((result) => {
            this.setState({location: result.selectedFolder})
        });
    }

    /**
     * waitForAccount function
     * add listener for menu action (account)
     */
    waitForAccount = async () => {
        return await window.electron.waitForAccount()
    }

    /**
     * waitForImportMenuFromElectron function
     * add listener for menu action (import)
     */
    waitForImportMenuFromElectron = async () => {
        return await window.electron.waitForImportMenuFromElectron()
    }

    /**
     * logoutImmediate function
     * clear stored react application properties
     */
    logoutImmediate = () => {
        clearTimeout(this.state.timer)
        this.setState({timer: null})
        clearTimeout(this.state.fetchTimer)
        this.setState({fetchTimer: null})
        this.props.clearAppState()
        return window.electron.logoutImmediate()
    }
}


/**
 * Class PasswordFieldController
 * View Controller for PasswordField with electron binders
 */
class PasswordFieldController extends CustomComponent {
    /**
     * getDefaultSecurity function
     * get stored clipboard timeout
     */
    getDefaultSecurity = async () => {
        return await window.electron.getDefaultSecurity().then((result) => {
            let timeout = null
            if (result?.response !== null) {
                timeout = parseInt(result?.response?.clearTimeout)
                if (timeout !== -1) {
                    timeout = timeout * 1000
                }
            }
            return timeout;
        })
    }
    /**
     * copy function clears clipboard on focus
     *
     * saves value to clipboard and starts timer for clipboard clear
     *
     @param   text   text to be saved to clipboard
     */
    copy = async (text) => {
        let that = this
        let timeout = await this.getDefaultSecurity()
        if (timeout === null) {
            timeout = 10 * 1000; //10 seconds
        }
        await navigator.clipboard.writeText(text);
        if (timeout !== -1) {
            setTimeout(async () => {
                await navigator.clipboard.writeText(PMReactUtils.EMPTY_STRING).catch(() => {
                    that.clearClipboardOnFocus()
                });
            }, timeout);
        }
    }
}


/**
 * Class AccountViewController
 * View Controller for PasswordField with electron binders
 */
class AccountViewController extends CustomComponent {
    /**
     * getDefaultSecurity function
     * get default timeouts
     */
    getDefaultSecurity = async () => {
        return window.electron.getDefaultSecurity()
    }

    /**
     * setDefaultSecurity function
     * set default timeouts
     */
    setDefaultSecurity = async (timeouts) => {
        return window.electron.setDefaultSecurity(timeouts)
    }
}

export {
    CustomComponent,
    LoginAndRegistrationComponent,
    LocalLoginViewController,
    LocalRegistrationViewController,
    DefaultLoginViewController,
    PasswordItemViewController,
    RegistrationViewController,
    PasswordListViewController,
    PasswordFieldController,
    AccountViewController
}