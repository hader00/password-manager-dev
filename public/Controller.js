const {dialog} = require('electron')
const path = require('path');
const {DatabaseCrypto} = require("./DatabaseCrypto");
const {DATABASE_FILENAME} = require("./Util");
const {DEFAULT_LOCAL_DB_LOCATION} = require("./Util");
const {isEmpty} = require("./Util");
const {VIEW_TYPE} = require("./Util");
const {ElectronStore} = require("./ElectronStore");
const {DatabaseConnector} = require("./DatabaseConnector");
const {DBModeEnum} = require("./Util");
const {PasswordGenerator} = require("./PasswordGenerator");
const axios = require('axios');


class Controller {
    constructor() {
        this.win = null
        this.electronStore = new ElectronStore();
        this.databaseConnector = new DatabaseConnector();
        this.isFirstLogin = false;
        this.loginMode = null;
        this.server = null;
        this.userID = null;
        this.customDatabaseLocation = null;

        if (!this.electronStore.has("defaultView")) {
            this.isFirstLogin = true;
            this.electronStore.set("defaultView", VIEW_TYPE.defaultLoginView);
        } else {
            this.customDatabaseLocation = this.electronStore.get("customDatabaseLocation");
        }
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

    async remoteLogin(server, email, password, saveEmail) {
        let remoteLoginSuccess;
        let that = this;

        remoteLoginSuccess = axios.post(`${this.getServer(server)}/api/password-manager/user-login`, {
            email: email,
            password: DatabaseCrypto.getHMAC(password)
        })
            .then(function (response) {
                console.log("response:", response)
                if (response?.data?.success === true) {
                    that.userID = response.data.id;
                    that.loginMode = DBModeEnum.remote;
                    return true;
                }
                return false;
            })
            .catch(function (error) {
                console.log("error:", error.data)
                console.log(error.data);
                return false;
            });

        if (remoteLoginSuccess && saveEmail) {
            this.electronStore.set("storedEmail", email)
        }
        return remoteLoginSuccess;
    }

    async remoteRegistration(server, email, password, confirmationPassword, firstName, lastName) {
        if (password !== confirmationPassword) {
            return false;
        }
        let that = this;
        return axios.post(`${this.getServer(server)}/api/password-manager/user-create`, {

            firstName: firstName,
            lastName: lastName,
            email: email,
            password: DatabaseCrypto.getHMAC(password)
        })
            .then(function (response) {
                if (response?.data?.success === true) {
                    that.userID = response.data.id;
                    that.loginMode = DBModeEnum.remote;
                    return true;
                }
                return false;
            })
            .catch(function (error) {
                console.log(error.data);
                return false;
            });
    }

    async addPassword(title, description, url, username, password) {
        let addSuccess;
        console.log(password)
        if (password !== "" && password !== null && password !== undefined && password !== "undefined") {
            password = DatabaseCrypto.encrypt(password);
        }
        if (this.databaseConnector.existsDatabase() && this.databaseConnector.getMode() === this.loginMode && this.loginMode === DBModeEnum.local) {
            let msg = `INSERT INTO Passwords (title, description, url, username, password)` +
                `VALUES ('${title}', '${description}', '${url}', ` +
                `'${username}', '${password}');`
            addSuccess = await this.databaseConnector.sendMessage(msg)
                .then(result => {
                    console.log("--------------------------------------");
                    console.log("addSuccess async", result.response)
                    return result.response
                });
        } else {
            addSuccess = await axios.post(`${this.getServer("")}/api/password-manager/password-create`, {
                title: title,
                description: description,
                url: url,
                username: username,
                password: password,
                userID: this.userID,
            })
                .then(function (response) {
                    console.log(response);
                    return response?.data?.success;
                })
                .catch(function (error) {
                    console.log(error);
                    return false
                });

        }
        console.log("addSuccess sync", addSuccess);
        console.log("^should have same value");
        return addSuccess
    }

    async updatePassword(id, title, description, url, username, password) {
        console.log(id, title, description, url, username, password)
        let updateSuccess;
        password = DatabaseCrypto.encrypt(password);
        if (this.databaseConnector.existsDatabase() && this.databaseConnector.getMode() === this.loginMode && this.loginMode === DBModeEnum.local) {
            let msg = `UPDATE Passwords ` +
                `SET title = '${title}', description = '${description}', url = '${url}', ` +
                `username = '${username}', password = '${password}' ` +
                `WHERE Id = ${id};`
            updateSuccess = await this.databaseConnector.sendMessage(msg)
                .then(result => {
                    console.log("--------------------------------------");
                    console.log("updatePassword async", result.response)
                    return result.response
                });
        } else {
            updateSuccess = await axios.post(`${this.getServer("")}/api/password-manager/password-update`, {
                id: id,
                title: title,
                description: description,
                url: url,
                username: username,
                password: password,
                userID: this.userID,
            })
                .then(function (response) {
                    console.log(response);
                    return response?.data?.success;
                })
                .catch(function (error) {
                    console.log(error);
                    return false
                });
        }
        return updateSuccess
    }

    async deletePassword(id) {
        let deleteSuccess;
        if (this.databaseConnector.existsDatabase() && this.databaseConnector.getMode() === this.loginMode && this.loginMode === DBModeEnum.local) {
            let msg = `DELETE FROM Passwords WHERE id = ${id}`;
            deleteSuccess = await this.databaseConnector.sendMessage(msg)
                .then(result => {
                    console.log("--------------------------------------");
                    console.log("deleteSuccess async", result.response)
                    return result.response
                });
        } else {
            deleteSuccess = await axios.post(`${this.getServer("")}/api/password-manager/password-delete`, {
                id: id,
                userID: this.userID,
            })
                .then(function (response) {
                    console.log(response);
                    return response?.data?.success;
                })
                .catch(function (error) {
                    console.log(error);
                    return false
                });
        }
        return deleteSuccess
    }

    async fetchPasswords() {
        let fetchedPasswords;
        if (this.loginMode === DBModeEnum.local && this.databaseConnector.existsDatabase() && this.databaseConnector.getMode() === this.loginMode && this.loginMode === DBModeEnum.local) {
            let msg = "SELECT * FROM Passwords";
            fetchedPasswords = await this.databaseConnector.sendMessage(msg)
                .then(result => {
                    console.log("--------------------------------------");
                    console.log("fetchPasswords async", result.response, result.result)
                    if (result.response === true) {
                        return result.result
                    }
                });
        } else {
            fetchedPasswords = await axios.post(`${this.getServer("")}/api/password-manager/password-fetch`, {
                userID: this.userID,
            })
                .then(function (response) {
                    console.log(response.data);
                    return response.data
                })
                .catch(function (error) {
                    console.log(error);
                    return []
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

    getServer(server) {
        if (isEmpty(server)) {
            server = "https://password-manager-mysql.herokuapp.com";
        }
        //todo check server validity (with api)
        return server
    }

    async isServerValid(server) {
        console.log("server", server)
        return await axios.get(`${this.getServer(server)}/available`
            ).then((res) => {
            console.log(res);
            if (res.data.success) {
                this.server = server
                // Save server if not saved before
                if (!this.electronStore.has("storedServer")) {
                    this.electronStore.set("storedServer", server)
                }
                return true
            }
            return false
        }).catch((err) => {
            return false
        })
    }

    async getEmail() {
        let email = ""
        if (this.electronStore.has("storedEmail")) {
            email = await this.electronStore.get("storedEmail");
        }
        return email;
    }

    async getStoredServer() {
        let server = ""
        if (this.electronStore.has("storedServer")) {
            server = await this.electronStore.get("storedServer");
        }
        return server
    }

    getLoginMode() {
        return this.loginMode
    }

    getDatabaseConnector() {
        return this.databaseConnector
    }
}

module.exports = {Controller}