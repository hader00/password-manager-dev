import {Component} from "react";
import ViewType from "./shared/other/ViewType";

class LocalLoginViewController extends Component {
    selectFile = () => {
        document.getElementById('hiddenField').addEventListener('click', (e) => {
            e.preventDefault();
            window.electron.selectFile().then((result) => {
                this.setState({location: result.selectedFile})
            });
        })
    }
    //
    handleViewChange = (location) => {
        this.props.changeParentsActiveView(location);
    }
    //
    submitLogin = (password, location) => {
        window.electron.localLogin(password, location).then((result) => {
            if (result.localLoginSuccess === true) {
                this.handleViewChange(ViewType.passwordListView);
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

class LocalRegistrationViewController extends Component {
    selectFolder = () => {
        document.getElementById('hiddenField').addEventListener('click', (e) => {
            e.preventDefault();
            window.electron.selectFolder().then((result) => {
                this.setState({location: result.selectedFolder})
            });
        })
    }
    //
    handleViewChange = (location) => {
        this.props.changeParentsActiveView(location);
    }
    //
    submitRegistration = (password, location) => {
        window.electron.localRegistration(password, location).then((result) => {
            if (result.localRegistrationSuccess === true) {
                this.props.changeParentsActiveView(ViewType.passwordListView);
            } else {
                // todo warning
            }
        });
    }
}

class DefaultLoginViewController extends Component {
    //
    openSnackbar = () => {
        this.setState({snackbarOpen: true})
    }
    //
    checkServerAvailability = async (server) => {
        return await window.electron.checkServerAvailability(server)
    }
    //
    dbExists = async () => {
        await window.electron.dbExists().then((result) => {
            if (result.dbExists === true) {
                this.popAndChangeView(ViewType.localLoginView);
            } else {
                this.popAndChangeView(ViewType.localRegistrationView);
            }
        });
    }
    //
    submitSubmitLogin = (userServer, userEmail, userPassword, saveEmail) => {
        window.electron.submitLogin(userServer, userEmail, userPassword, saveEmail).then((result) => {
            if (result.remoteLoginSuccess === true) {
                this.setState({server: ""})
                this.popAndChangeView(ViewType.passwordListView);
            } else {
                this.setState({loading: false});
                this.openSnackbar();
            }
        })
    }
    //
    popAndChangeView = (destinationView) => {
        this.props.changeParentsActiveView(destinationView);
    }
    //
    getEmail = () => {
        window.electron.getEmail().then((result) => {
            if (result.email !== "") {
                this.setState({email: result.email})
                this.setState({saveEmail: true})
            }
        })
    }

    getServer = () => {
        window.electron.getServer().then(async (result) => {
            console.log("result.server", result.server)
            this.setState({server: result.server === "null" && result.server === null ? "" : result.server})
            this.setState({checked: result.server !== "null" && result.server !== null && result.server !== ""})
            await this.checkServer(result.server)
        })
    }
}

class PasswordItemViewController extends Component {
    decryptPassword = async (encryptedPassword) => {
        return await window.electron.decryptPassword(encryptedPassword).then(r => {
            return r.password
        })
    }
    //
    popView = () => {
        this.props.changeParentsActiveView(ViewType.passwordListView);
    }
    //
    generatePassword = (length, specialCharacters, numbers, lowerCase, upperCase) => {
        window.electron.generatePassword(length, specialCharacters, numbers, lowerCase, upperCase).then((result) => {
            if (result.password.length > 0) {
                this.setState({password: result.password})
            } else {
            }
        });
    }
    //
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
                    this.popView();
                } else {

                }
            });
        }
    }
    //
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
                    this.popView();
                } else {
                }
            });
        }
    }
    //
    deletePassword = () => {
        if (!this.state.deleteLoading) {
            let id = this.state.id;
            this.setState({deleteLoading: true});
            window.electron.deletePassword(id).then((result) => {
                if (result.deleteSuccess === true) {
                    this.popView();
                } else {
                }
            });
        }
    }

    waitForSaveItem = async () => {
        return await window.electron.waitForSaveItem()
    }

    waitForDeleteItem = async () => {
        return await window.electron.waitForDeleteItem()
    }

}

class RegistrationViewController extends Component {
    //
    openSnackbar = () => {
        this.setState({snackbarOpen: true})
    }
    //
    checkServerAvailability = async (server) => {
        return await window.electron.checkServerAvailability(server)
    }
    //
    handleViewChange = (view) => {
        this.props.changeParentsActiveView(view);
    }
    //
    submitSubmitRegistration = (userServer, userEmail, userPassword,
                                userConfirmPassword, userFirstName, userLastName) => {
        window.electron.submitRegistration(userServer, userEmail, userPassword,
            userConfirmPassword, userFirstName, userLastName).then((result) => {
            if (result.remoteRegistrationSuccess === true) {
                this.handleViewChange(ViewType.passwordListView);
            } else {
                this.setState({loading: false});
                this.openSnackbar();
            }
        })
    }
}

class PasswordListViewController extends Component {
    selectFolder = () => {
        let element = document.getElementById('hiddenField')
        if (element !== null) {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                window.electron.selectFolder().then((result) => {
                    this.setState({location: result.selectedFolder})
                });
            })
        }
    }

    waitForAccount = async () => {
        return await window.electron.waitForAccount()
    }

    logoutImmediate = () => {
        return window.electron.logoutImmediate()
    }
}

class PasswordFieldController extends Component {
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
}

class AccountViewController extends Component {
    getDefaultSecurity = async () => {
        return window.electron.getDefaultSecurity()
    }

    setDefaultSecurity = async (timeouts) => {
        return window.electron.setDefaultSecurity(timeouts)
    }
}

export {
    LocalLoginViewController,
    LocalRegistrationViewController,
    DefaultLoginViewController,
    PasswordItemViewController,
    RegistrationViewController,
    PasswordListViewController,
    PasswordFieldController,
    AccountViewController
}