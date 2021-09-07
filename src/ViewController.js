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
                // todo warning
                console.log("Login unsuccessful");
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
    submitSubmitLogin = (userServer, userEmail, userPassword) => {
        window.electron.submitLogin(userServer, userEmail, userPassword).then((result) => {
            if (result.remoteLoginSuccess === true) {
                this.popAndChangeView(ViewType.passwordListView);
            }
        })
    }
    //
    popAndChangeView = (destinationView) => {
        this.props.changeParentsActiveView(destinationView);
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
                this.setState({Password: result.password})
            } else {
                console.log("fail")
                console.log(result)
            }
        });
    }
    //
    addPassword = () => {
        let Title = this.state.Title;
        let Description = this.state.Description;
        let Url = this.state.Url;
        let Username = this.state.Username;
        let Password = this.state.Password;
        window.electron.addPassword(Title, Description, Url, Username, Password).then((result) => {
            if (result.addSuccess === true) {
                console.log(result)
                this.popView();
            } else {
                console.log("fail")
                console.log(result)
            }
        });
    }
    //
    updatePassword = () => {
        console.log("updating")
        let Id = this.state.Id;
        let Title = this.state.Title;
        let Description = this.state.Description;
        let Url = this.state.Url;
        let Username = this.state.Username;
        let Password = this.state.Password;
        window.electron.updatePassword(Id, Title, Description, Url, Username, Password).then((result) => {
            if (result.updateSuccess === true) {
                console.log(result)
                this.popView();
            } else {
                console.log("fail")
                console.log(result)
            }
        });
    }
    //
    deletePassword = () => {
        let Id = this.state.Id;
        window.electron.deletePassword(Id).then((result) => {
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

class PasswordListViewController extends Component {
    fetchAllPPasswords = () => {
        console.log("Fetching all passwords");
        window.electron.fetchAllPPasswords().then((result) => {
            console.log(result);
            this.setState({response: result.response});
            this.setState({passwords: result.response});
        });
    }
}

class RegistrationViewController extends Component {
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
                // todo ui warning
            }
        })
    }
}

export {
    LocalLoginViewController,
    LocalRegistrationViewController,
    DefaultLoginViewController,
    PasswordItemViewController,
    PasswordListViewController,
    RegistrationViewController
}