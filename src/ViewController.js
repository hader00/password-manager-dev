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
    changeParentsActiveView = (newActiveView) => {
        this.props.changeParentsActiveView(newActiveView);
    }
    //
    submitRegistration = (password, location) => {
        window.electron.localRegistration(password, location).then((result) => {
            if (result.localRegistrationSuccess === true) {
                this.changeParentsActiveView(ViewType.passwordListView);
            } else {
                // todo warning
                console.log("Registration NOT successful");
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
    dbExists = () => {
        window.electron.dbExists().then((result) => {
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
        window.electron.getServer().then((result) => {
            if (result.server !== "") {
                this.setState({server: result.server})
            }
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
        console.log(length, specialCharacters, numbers, lowerCase, upperCase)
        window.electron.generatePassword(length, specialCharacters, numbers, lowerCase, upperCase).then((result) => {
            console.log(result)
            if (result.password.length > 0) {
                this.setState({password: result.password})
            } else {
                console.log("fail")
                console.log(result)
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
                    console.log(result)
                    this.popView();
                } else {
                    console.log(result)
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
                    console.log(result)
                    this.popView();
                } else {
                    console.log(result)
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
                console.log("deleting")
                if (result.deleteSuccess === true) {
                    console.log(result)
                    this.popView();
                } else {
                    console.log("fail")
                    console.log(result)
                }
            });
        }
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

export {
    LocalLoginViewController,
    LocalRegistrationViewController,
    DefaultLoginViewController,
    PasswordItemViewController,
    RegistrationViewController
}