const {dialog} = require('electron')
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const {Crypto} = require("./Crypto");
const {ElectronStore} = require("./ElectronStore");
const {DatabaseConnector} = require("./DatabaseConnector");
const {
    VIEW_TYPE,
    DEFAULT_LOCAL_DB_LOCATION,
    DATABASE_FILENAME,
    DBModeEnum,
    SECRET,
    isEmpty,
    LOCAL_SECRET
} = require("./Util");
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
        this.passwordKey = null;
        this.symmetricKey = null;
        this.customDatabaseLocation = null;
        this.extensionState = null;

        if (!this.electronStore.has("defaultView")) {
            this.isFirstLogin = true;
            this.electronStore.set("defaultView", VIEW_TYPE.defaultLoginView);
        }
        if (this.electronStore.has("customDatabaseLocation")) {
            this.customDatabaseLocation = this.electronStore.get("customDatabaseLocation");
        }
    }

    async remoteLogin(server, email, masterPassword, saveEmail) {
        let remoteLoginSuccess;
        let that = this;

        // generate Salt (Stretched email to 16 bytes)
        const stretchedEmail = await Crypto.getHKDF(email, SECRET, 16);
        // normalize master password
        const normalizedMasterPassword = masterPassword.normalize('NFKD')
        // stretch master password to 32 bytes
        const stretchedMasterPassword = await Crypto.getHKDF(normalizedMasterPassword, stretchedEmail, 32)
        // create Password Key (Master Key)
        const passwordKey = Crypto.getPBKDF2(stretchedMasterPassword, stretchedEmail, 100000)
        // create Master Password Hash (Master Password Hash)
        const masterPasswordHash = Crypto.getPBKDF2(passwordKey, stretchedMasterPassword, 1)

        const currentServer = this.getServer(server)
        remoteLoginSuccess = await axios.post(`${currentServer}/api/password-manager/user-login`, {
            email: email,
            password: masterPasswordHash
        })
            .then(async function (response) {
                if (response?.data?.success === true) {
                    const encryptionKey = await Crypto.getHKDF(passwordKey, stretchedEmail, 32).then(r => {
                        return r
                    })
                    const {decryptedData} = Crypto.decrypt(response.data.encryptedSymmetricKey, response.data.iv, encryptionKey)

                    that.server = currentServer
                    that.userID = response.data.id
                    that.passwordKey = passwordKey
                    that.symmetricKey = decryptedData
                    that.loginMode = DBModeEnum.remote
                    return true;
                }
                return false;
            })
            .catch(function (error) {
                console.log("error", error.data)
                return false;
            });

        if (remoteLoginSuccess && saveEmail) {
            this.electronStore.set("storedEmail", email)
        }
        if (remoteLoginSuccess) {
            this.extensionState = true
        }
        return remoteLoginSuccess;
    }

    async remoteRegistration(server, email, masterPassword, confirmationPassword, firstName, lastName) {
        if (masterPassword !== confirmationPassword) {
            return false;
        }
        let that = this;

        // generate Salt (Stretched email to 16 bytes)
        const stretchedEmail = await Crypto.getHKDF(email, SECRET, 16);
        // normalize master password
        const normalizedMasterPassword = masterPassword.normalize('NFKD')
        // stretch master password to 32 bytes
        const stretchedMasterPassword = await Crypto.getHKDF(normalizedMasterPassword, stretchedEmail, 32)
        // create Password Key (Master Key)
        const passwordKey = Crypto.getPBKDF2(stretchedMasterPassword, stretchedEmail, 100000)
        // create Master Password Hash (Master Password Hash)
        const masterPasswordHash = Crypto.getPBKDF2(passwordKey, stretchedMasterPassword, 1)

        // create Encryption Key (Stretched Master Key)
        const encryptionKey = await Crypto.getHKDF(passwordKey, stretchedEmail, 32)
        // Generate IV
        const iv = crypto.randomBytes(16).toString('hex');
        // Create SymmetricKey
        const symmetricKey = crypto.randomBytes(32).toString('hex');
        // encrypt Symmetric Key
        let {encryptedData} = Crypto.encrypt(symmetricKey, iv, encryptionKey)
        const encryptedSymmetricKey = encryptedData

        const currentServer = this.getServer(server)

        const registrationSuccess = await axios.post(`${currentServer}/api/password-manager/user-create`, {
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: masterPasswordHash,
            iv: iv,
            encryptedSymmetricKey: encryptedSymmetricKey,
        })
            .then(async function (response) {
                if (response?.data?.success === true) {
                    that.server = currentServer
                    that.userID = response.data.id
                    that.passwordKey = passwordKey
                    that.symmetricKey = symmetricKey
                    that.loginMode = DBModeEnum.remote;
                    return true;
                }
                return false;
            })
            .catch(function (error) {
                console.log("error", error)
                return false;
            });
        if (registrationSuccess) {
            this.extensionState = true
        }
        return registrationSuccess
    }

    async fetchPasswords() {
        let decryptedFetchedPasswords = []
        let fetchedPasswords
        if (this.loginMode === DBModeEnum.local) {
            let msg = "SELECT * FROM Passwords";
            fetchedPasswords = await this.databaseConnector.sendMessage(msg)
                .then(result => {
                    if (result.response === true) {
                        return result.result
                    }
                }).catch(function (error) {
                    return []
                });
        } else {
            fetchedPasswords = await axios.post(`${this.server}/api/password-manager/password-fetch`, {
                userID: this.userID,
            })
                .then(function (response) {
                    return response.data
                })
                .catch(function (error) {
                    return []
                });
        }
        fetchedPasswords.forEach(password => {
            let item = JSON.parse(Crypto.decryptPassword(password['item'], this.symmetricKey))
            item['id'] = password['id'];
            decryptedFetchedPasswords.push(item)
        })
        return decryptedFetchedPasswords

    }

    async addPassword(title, description, url, username, password) {
        let status;

        if (password !== "" && password !== null && password !== undefined && password !== "undefined") {
            password = Crypto.encryptPassword(password, this.symmetricKey);
        }
        let item = {
            title: title,
            description: description,
            url: url,
            username: username,
            password: password
        }
        let encryptedItem = Crypto.encryptPassword(JSON.stringify(item), this.symmetricKey);
        if (this.loginMode === DBModeEnum.local) {
            let msg = `INSERT INTO Passwords (item) VALUES ('${encryptedItem}');`
            status = await this.databaseConnector.sendMessage(msg)
                .then(result => {
                    return result.response
                });
        } else {
            status = await axios.post(`${this.server}/api/password-manager/password-create`, {
                item: encryptedItem,
                userID: this.userID,
            })
                .then(function (response) {
                    return response?.data?.success;
                })
                .catch(function (error) {
                    console.log("error", error);
                    return false
                })
        }
        return status
    }

    async updatePassword(id, title, description, url, username, password) {
        let status;
        if (password !== "" && password !== null && password !== undefined && password !== "undefined") {
            password = Crypto.encryptPassword(password, this.symmetricKey);
        }
        let item = {
            title: title,
            description: description,
            url: url,
            username: username,
            password: password
        }
        let encryptedItem = Crypto.encryptPassword(JSON.stringify(item), this.symmetricKey);

        if (this.loginMode === DBModeEnum.local) {
            let msg = `UPDATE Passwords ` +
                `SET item = '${encryptedItem}'` +
                `WHERE Id = ${id};`
            status = await this.databaseConnector.sendMessage(msg)
                .then(result => {
                    return result.response
                });
        } else {
            status = await axios.post(`${this.server}/api/password-manager/password-update`, {
                id: id,
                item: encryptedItem,
                userID: this.userID,
            })
                .then(function (response) {
                    return response?.data?.success;
                })
                .catch(function (error) {
                    console.log("error", error);
                    return false
                })
        }
        return status
    }

    async deletePassword(id) {
        let status;
        if (this.loginMode === DBModeEnum.local) {
            let msg = `DELETE FROM Passwords WHERE id = ${id}`;
            status = await this.databaseConnector.sendMessage(msg)
                .then(result => {
                    return result.response
                });
        } else {
            status = await axios.post(`${this.server}/api/password-manager/password-delete`, {
                id: id,
                userID: this.userID,
            })
                .then(function (response) {
                    return response?.data?.success;
                })
                .catch(function (error) {
                    console.log(error);
                    return false
                });
        }
        return status
    }


    async localLogin(password, location) {
        if (isEmpty(location)) {
            location = DEFAULT_LOCAL_DB_LOCATION;
        }
        let localLoginResult = await this.databaseConnector.openDatabase(location, password);
        if (localLoginResult && this.isFirstLogin) {
            this.electronStore.set("defaultView", VIEW_TYPE.localLoginView)
        }
        if (localLoginResult === true) {
            // normalize master password
            const normalizedMasterPassword = password.normalize('NFKD')
            // stretch master password to 32 bytes
            const stretchedMasterPassword = await Crypto.getHKDF(normalizedMasterPassword, LOCAL_SECRET, 32)
            // create Password Key (Master Key)
            const passwordKey = Crypto.getPBKDF2(stretchedMasterPassword, LOCAL_SECRET, 100000)
            // create Master Password Hash (Master Password Hash)
            const masterPasswordHash = Crypto.getPBKDF2(passwordKey, stretchedMasterPassword, 1)
            let msg = "SELECT * FROM Validation";
            let fetchedValidation = await this.databaseConnector.sendMessage(msg)
                .then(result => {
                    if (result.response === true) {
                        return result.result[0]
                    } else {
                        return result.response
                    }
                });
            if (fetchedValidation['item'] === masterPasswordHash) {
                // create Encryption Key (Stretched Master Key)
                const encryptionKey = await Crypto.getHKDF(passwordKey, LOCAL_SECRET, 32)

                this.loginMode = DBModeEnum.local
                this.passwordKey = passwordKey
                this.symmetricKey = encryptionKey
                this.electronStore.set("defaultView", VIEW_TYPE.localLoginView)
                this.electronStore.set("customDatabaseLocation", location)
            } else {
                localLoginResult = false
            }
        }
        if (localLoginResult) {
            this.extensionState = true
        }
        return localLoginResult;
    }

    async exportPasswords(password, email, location) {
        if (this.loginMode === DBModeEnum.remote) {
            // normalize master password
            const stretchedEmail = await Crypto.getHKDF(email, SECRET, 16);
            // normalize master password
            const normalizedMasterPassword = password.normalize('NFKD')
            // stretch master password to 32 bytes
            const stretchedMasterPassword = await Crypto.getHKDF(normalizedMasterPassword, stretchedEmail, 32)
            // create Password Key (Master Key)
            const passwordKey = Crypto.getPBKDF2(stretchedMasterPassword, stretchedEmail, 100000)
            if (passwordKey !== this.passwordKey) {
                return false;
            }
        } else {
            // normalize master password
            const normalizedMasterPassword = password.normalize('NFKD')
            // stretch master password to 32 bytes
            const stretchedMasterPassword = await Crypto.getHKDF(normalizedMasterPassword, LOCAL_SECRET, 32)
            // create Password Key (Master Key)
            const passwordKey = Crypto.getPBKDF2(stretchedMasterPassword, LOCAL_SECRET, 100000)
            if (passwordKey !== this.passwordKey) {
                return false;
            }
        }
        let decryptedPasswords = []
        const fetchedPasswords = await this.fetchPasswords()
        for (const password1 of fetchedPasswords) {
            if (password1['password'] !== '') {
                password1['password'] = await this.decryptPassword(password1['password'], this.symmetricKey)
            }
            decryptedPasswords.push(password1)
        }
        const keys = Object.keys(decryptedPasswords[0]);
        let result = keys.join(",") + "\n";
        decryptedPasswords.forEach(function (obj) {
            result += keys.map(k => obj[k]).join(",") + "\n";
        });
        const date = new Date();
        const timedate = date.toISOString().slice(0, 19).replace(/-/g, "").replace(/T/g, "").replace(/:/g, "");
        fs.writeFileSync(location + `/${timedate}.csv`, result);
        return true
    }

    async localRegistration(password, location) {
        if (isEmpty(location)) {
            location = DEFAULT_LOCAL_DB_LOCATION;
        } else {
            location = path.resolve(location, DATABASE_FILENAME)
        }
        const localRegistrationResult = await this.databaseConnector.createDatabase(location);

        if (localRegistrationResult && this.isFirstLogin) {
            this.electronStore.set("defaultView", VIEW_TYPE.localLoginView)
            this.electronStore.set("customDatabaseLocation", location)
        }
        if (localRegistrationResult === true) {
            // normalize master password
            const normalizedMasterPassword = password.normalize('NFKD')
            // stretch master password to 32 bytes
            const stretchedMasterPassword = await Crypto.getHKDF(normalizedMasterPassword, LOCAL_SECRET, 32)
            // create Password Key (Master Key)
            const passwordKey = Crypto.getPBKDF2(stretchedMasterPassword, LOCAL_SECRET, 100000)
            // create Master Password Hash (Master Password Hash)
            const masterPasswordHash = Crypto.getPBKDF2(passwordKey, stretchedMasterPassword, 1)
            // create Encryption Key (Stretched Master Key)
            const encryptionKey = await Crypto.getHKDF(passwordKey, LOCAL_SECRET, 32)

            let msg = `INSERT INTO Validation (item) VALUES ('${masterPasswordHash}');`
            await this.databaseConnector.sendMessage(msg)
                .then(result => {
                    return result.response
                });
            this.passwordKey = passwordKey
            this.loginMode = DBModeEnum.local
            this.symmetricKey = encryptionKey
        }
        if (localRegistrationResult) {
            this.extensionState = true
        }
        return localRegistrationResult
    }

    dbExists() {
        return !this.isFirstLogin
    }

    setWin(win) {
        this.win = win
    }

    getDefaultView() {
        if (this.extensionState === true || this.symmetricKey !== null) {
            return "passwordList"
        } else {
            return this.electronStore.get("defaultView")
        }
    }

    getDefaultSecurity() {
        const clearTimeout = this.electronStore.get("clearTimeout")
        const logoutTimeout = this.electronStore.get("logoutTimeout")
        return {clearTimeout: clearTimeout, logoutTimeout: logoutTimeout}
    }

    setDefaultSecurity(timeouts) {
        this.electronStore.set("clearTimeout", timeouts['clipboardTime'])
        this.electronStore.set("logoutTimeout", timeouts['time'])
        return true
    }

    extensionLogin() {
        this.extensionIsLogin = true;
    }


    async decryptPassword(password) {
        if (password !== '') {
            return Crypto.decryptPassword(password, this.symmetricKey)
        } else {
            return password
        }
    }

    async generatePassword(length, specialCharacters, numbers, lowerCase, upperCase) {
        return PasswordGenerator.generatePassword(length, specialCharacters, numbers, lowerCase, upperCase);
    }

    async selectDatabase() {
        const result = await dialog.showOpenDialog(this.win, {
            properties: ['openFile']
        })
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
        return server
    }

    async isServerValid(server) {
        return await axios.get(`${server}/available`
        ).then((res) => {
            if (res.data.success) {
                // Save server if not saved before
                if (!this.electronStore.has("storedServer")) {
                    this.electronStore.set("storedServer", server)
                }
                return true
            }
            return false
        }).catch((err) => {
            console.log("error", err)
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

    getDatabase() {
        return this.customDatabaseLocation
    }

    logoutImmediate() {
        this.loginMode = null;
        this.server = null;
        this.userID = null;
        this.passwordKey = null;
        this.symmetricKey = null;
        this.customDatabaseLocation = null;
        this.extensionState = null;
        this.server = null;
    }

}

module.exports = {Controller}