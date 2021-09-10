const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const path = require('path');
const isDev = require('electron-is-dev');
const {DatabaseCrypto} = require("./DatabaseCrypto");
const {DATABASE_FILENAME} = require("./Util");
const {DEFAULT_LOCAL_DB_LOCATION} = require("./Util");
const {isEmpty} = require("./Util");
const {VIEW_TYPE} = require("./Util");
const {ElectronStore} = require("./ElectronStore");
const {DatabaseConnector} = require("./DatabaseConnector");
const {DBModeEnum} = require("./Util");
const url = require('url');
const {PasswordGenerator} = require("./PasswordGenerator");
const axios = require('axios');


class Controller {
    constructor() {
        this.win = null
        this.electronStore = new ElectronStore();
        this.databaseConnector = new DatabaseConnector();
        this.isFirstLogin = false;
        this.loginMode = null;
        this.userID = null;
        this.customDatabaseLocation = null;

        // todo move to "clear" button + delete local DB before publishing
        //this.electronStore.remove("defaultView");
        //this.electronStore.remove("customDatabaseLocation");

        if (!this.electronStore.has("defaultView")) {
            this.isFirstLogin = true;
            this.electronStore.set("defaultView", VIEW_TYPE.defaultLoginView);
        } else {
            this.customDatabaseLocation = this.electronStore.get("customDatabaseLocation");
        }
    }

    setWin(win) {
        this.win = win
    }

    getDefaultView() {
        return this.electronStore.get("defaultView")
    }

    async decryptPassword(password) {
        return DatabaseCrypto.decrypt(password)
    }

    async generatePassword(length, specialCharacters, numbers, lowerCase, upperCase) {
        return PasswordGenerator.generatePassword(length, specialCharacters, numbers, lowerCase, upperCase);
    }

    async selectDatabase() {
        console.log("selecting DB")
        const result = await dialog.showOpenDialog(this.win, {
            properties: ['openFile']
        })
        console.log('Selected file: => ', result.filePaths)
        let selectedFile = "";
        if (result.filePaths.length > 0) {
            selectedFile = result.filePaths[0]
        }
        return selectedFile
    }

    async selectFolder() {
        const result = await dialog.showOpenDialog(this.win, {
            properties: ['openDirectory']
        })
        console.log('Selected folder: => \'', result.filePaths)
        let selectedFolder = "";
        if (result.filePaths.length > 0) {
            selectedFolder = result.filePaths[0]
        }
        return selectedFolder
    }

    async localLogin(password, location) {
        if (isEmpty(location)) {
            location = DEFAULT_LOCAL_DB_LOCATION;
        }
        const localLoginResult = await this.databaseConnector.openDatabase(DBModeEnum.local, location, password);
        if (localLoginResult && this.isFirstLogin) {
            this.electronStore.set("defaultView", VIEW_TYPE.localLoginView)
        }
        if (localLoginResult === true) {
            this.loginMode = DBModeEnum.local
        }
        return localLoginResult;
    }

    async localRegistration(password, location) {
        if (isEmpty(location)) {
            location = DEFAULT_LOCAL_DB_LOCATION;
        } else {
            location = path.resolve(location, DATABASE_FILENAME)
        }
        const localRegistrationResult = await this.databaseConnector.createDatabase(location, password);
        if (localRegistrationResult && this.isFirstLogin) {
            this.electronStore.set("defaultView", VIEW_TYPE.localLoginView)
            // todo: save customDatabase Location
            // this.electronStore.set("customDatabaseLocation", location)
        }
        if (localRegistrationResult === true) {
            this.loginMode = DBModeEnum.local
        }
        return localRegistrationResult
    }

    async getEmail() {
        let email = ""
        if (this.electronStore.has("storedEmail")) {
            email = await this.electronStore.get("storedEmail");
        }
        return email;
    }

    async remoteLogin(server, email, password, saveEmail) {
        // todo add custom server
        let remoteLoginSuccess = false
        if (saveEmail) {
            this.electronStore.set("storedEmail", email)
        }
        if (this.databaseConnector.openDatabase(DBModeEnum.remote, "", "")) {
            remoteLoginSuccess = await this.databaseConnector.databaseRemoteLogin(email, password).then(r => {
                if (r.remoteLoginSuccess) {
                    this.userID = r.userID;
                }
                if (r.remoteLoginSuccess === true) {
                    this.loginMode = DBModeEnum.remote
                }
                console.log("--------------------------------------");
                console.log("remoteLoginSuccess async", r.remoteLoginSuccess)
                return r.remoteLoginSuccess
            })
        }
        console.log("remoteLoginSuccess sync", remoteLoginSuccess);
        console.log("^should have same value");
        return remoteLoginSuccess
    }

    async remoteRegistration(server, email, password, confirmationPassword, firstName, lastName) {
        // todo better handle of custom server
        // todo double check password
        let remoteRegistrationSuccess = false
        if (server === "") {
            server = "localhost:6868"
        }
        axios.post(`http://${server}/api/password-manager/user-create`, {
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password
        })
        .then(function (response) {
            console.log(response);
            this.userID = response.data.id;
            this.loginMode = DBModeEnum.remote;
            remoteRegistrationSuccess = true;
        })
        .catch(function (error) {
            console.log(error);
        });
        return remoteRegistrationSuccess

        /*
        if (this.databaseConnector.openDatabase(DBModeEnum.remote, "", "")) {
            remoteRegistrationSuccess = await this.databaseConnector.databaseRemoteRegister(email, password, firstName, lastName).then(r => {
                if (r.remoteRegistrationSuccess) {
                    this.userID = r.userID;
                }
                if (r.remoteRegistrationSuccess === true) {
                    this.loginMode = DBModeEnum.remote
                }
                console.log("--------------------------------------");
                console.log("remoteRegistrationSuccess async", r.remoteRegistrationSuccess)
                return r.remoteRegistrationSuccess
            })
        }
        console.log("remoteRegistrationSuccess sync", remoteRegistrationSuccess);
        console.log("^should have same value");
        return remoteRegistrationSuccess
        */
    }

    async addPassword(Title, Description, Url, Username, Password) {
        // todo reformat SQL
        let addSuccess = false;
        Password = DatabaseCrypto.encrypt(Password);
        let server = "localhost:6868"

        if (this.databaseConnector.existsDatabase() && this.databaseConnector.getMode() === this.loginMode) {
            let msg = "";
            if (this.loginMode === DBModeEnum.local) {
                msg = `INSERT INTO Passwords (Title, Description, Url, Username, Password)` +
                    `VALUES ('${Title}', '${Description}', '${Url}', ` +
                    `'${Username}', '${Password}');`
                addSuccess = await this.databaseConnector.sendMessage(msg)
                    .then(result => {
                        console.log("--------------------------------------");
                        console.log("addSuccess async", result.response)
                        return result.response
                    });
            } else {
                addSuccess = axios.post(`http://${server}/api/password-manager/user-create`, {
                    title: Title,
                    description: Description,
                    url: Url,
                    username: Username,
                    password: Password,
                    userID: this.userID,
                })
                    .then(function (response) {
                        console.log(response);
                        // todo add success
                        return true
                    })
                    .catch(function (error) {
                        console.log(error);
                        // todo add success
                        return false
                    });

                //msg = ["INSERT INTO Passwords (Title, Description, Url, Username, Password, UserID) VALUES (?,?,?,?,?,?)", [Title, Description, Url, Username, Password, this.userID]]
            }
            console.log("sending")
        }
        console.log("addSuccess sync", addSuccess);
        console.log("^should have same value");
        return addSuccess
    }

    async updatePassword(Id, Title, Description, Url, Username, Password) {
        // todo refactor SQL
        let updateSuccess = false
        Password = DatabaseCrypto.encrypt(Password);
        if (this.databaseConnector.existsDatabase() && this.databaseConnector.getMode() === this.loginMode) {
            let msg = "";
            if (this.loginMode === DBModeEnum.local) {
                msg = `UPDATE Passwords ` +
                    `SET Title = '${Title}', Description = '${Description}', Url = '${Url}', ` +
                    `Username = '${Username}', Password = '${Password}' ` +
                    `WHERE Id = ${Id};`
            } else {
                msg = ["UPDATE Passwords SET Title = ?, Description = ?, Url = ?, Username = ?, Password = ? WHERE userID = ? AND Id = ?", [Title, Description, Url, Username, Password, this.userID, Id]]
            }
            updateSuccess = await this.databaseConnector.sendMessage(msg)
                .then(result => {
                    console.log("--------------------------------------");
                    console.log("updatePassword async", result.response)
                    return result.response
                });
        }
        console.log("updatePassword sync", updateSuccess);
        console.log("^^^^^ should have same value ^^^^^");
        return updateSuccess
    }

    async deleteSuccess(Id) {
        let deleteSuccess = false
        if (this.databaseConnector.existsDatabase() && this.databaseConnector.getMode() === this.loginMode) {
            let msg = "";
            if (this.loginMode === DBModeEnum.local) {
                msg = `DELETE FROM Passwords WHERE Id = ${Id}`;
            } else {
                msg = ["DELETE FROM Passwords WHERE Id = ? AND UserId = ?", [Id, this.userID]];
            }
            deleteSuccess = await this.databaseConnector.sendMessage(msg)
                .then(result => {
                    console.log("--------------------------------------");
                    console.log("deleteSuccess async", result.response)
                    return result.response
                });
        }
        console.log("deleteSuccess sync", deleteSuccess);
        console.log("^^^^^ should have same value ^^^^^");
        return deleteSuccess
    }

    async fetchPasswords() {
        let fetchedPasswords = []
        if (this.databaseConnector.existsDatabase() && this.databaseConnector.getMode() === this.loginMode) {
            let msg = "";
            if (this.loginMode === DBModeEnum.local) {
                msg = "SELECT * FROM Passwords";
            } else {
                msg = ["SELECT * FROM Passwords WHERE (UserID=?)", [this.userID]];
            }
            fetchedPasswords = await this.databaseConnector.sendMessage(msg)
                .then(result => {
                    console.log("--------------------------------------");
                    console.log("fetchPasswords async", result.response, result.result)
                    if (result.response === true) {
                        return result.result
                    }
                });
        }
        console.log("fetchPasswords sync", fetchedPasswords);
        console.log("^^^^^ should have same value (checking result only)^^^^^");
        return fetchedPasswords
    }

    dbExists() {
        console.log("!isFirstLogin ", !this.isFirstLogin);
        return !this.isFirstLogin
    }
}

module.exports = {Controller}