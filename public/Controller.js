const {dialog} = require('electron')
const path = require('path');
const crypto = require('crypto');
const {DatabaseCrypto} = require("./DatabaseCrypto");
const {Crypto} = require("./Crypto");
const {ElectronStore} = require("./ElectronStore");
const {DatabaseConnector} = require("./DatabaseConnector");
const {VIEW_TYPE, DEFAULT_LOCAL_DB_LOCATION, DATABASE_FILENAME, DBModeEnum, SECRET, isEmpty, LOCAL_SECRET} = require("./Util");
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
        this.iv = null;
        this.localIv = null;
        this.symmetricKey = null;
        this.customDatabaseLocation = null;

        if (!this.electronStore.has("defaultView")) {
            this.isFirstLogin = true;
            this.electronStore.set("defaultView", VIEW_TYPE.defaultLoginView);
        } else {
            this.customDatabaseLocation = this.electronStore.get("customDatabaseLocation");
        }
    }

    async remoteLogin(server, email, masterPassword, saveEmail) {
        let remoteLoginSuccess;
        let that = this;

        // generate Salt (Stretched email to 16 bytes)
        const stretchedEmail = await Crypto.getHKDF(email, SECRET, 16);
        console.log("stretchedEmail", stretchedEmail)
        // normalize master password
        const normalizedMasterPassword = masterPassword.normalize('NFKD')
        console.log("normalizedMasterPassword", normalizedMasterPassword)
        // stretch master password to 32 bytes
        const stretchedMasterPassword = await Crypto.getHKDF(normalizedMasterPassword, stretchedEmail, 32)
        console.log("stretchedMasterPassword", stretchedMasterPassword)
        // create Password Key (Master Key)
        const passwordKey = Crypto.getPBKDF2(stretchedMasterPassword, stretchedEmail, 100000)
        console.log("passwordKey", passwordKey)
        // create Master Password Hash (Master Password Hash)
        const masterPasswordHash = Crypto.getPBKDF2(passwordKey, stretchedMasterPassword, 1)
        console.log("masterPasswordHash", masterPasswordHash)

        console.log("sending: ", {
            email: email,
            password: masterPasswordHash,
            server: this.getServer(server)
        })
        remoteLoginSuccess = await axios.post(`${this.getServer(server)}/api/password-manager/user-login`, {
            email: email,
            password: masterPasswordHash
        })
            .then(async function (response) {
                console.log("response?.data:", response?.data)
                console.log("success: ",response?.data?.success === true)
                if (response?.data?.success === true) {
                    const encryptionKey = await Crypto.getHKDF(passwordKey, stretchedEmail, 32).then(r => {return r})
                    console.log("encryptionKey: ", encryptionKey)
                    console.log("THIScalling Crypto.decrypt with : ", response.data.encryptedSymmetricKey, response.data.iv, encryptionKey)
                    const {decryptedData} = Crypto.decrypt(response.data.encryptedSymmetricKey, response.data.iv, encryptionKey)
                    console.log("decryptedData: ", decryptedData)
                    const encryptionIV = await Crypto.getHKDF(decryptedData, stretchedEmail, 16).then(r => {return r})
                    console.log("encryptionIV: ", encryptionIV)

                    console.log("saving:", {
                        userID: response.data.id,
                        iv: response.data.iv,
                        localIv: encryptionIV,
                        symmetricKey: decryptedData,
                        loginMode: DBModeEnum.remote,
                    })

                    that.userID = response.data.id
                    that.iv = response.data.iv
                    that.localIv = encryptionIV
                    that.symmetricKey = decryptedData
                    that.loginMode = DBModeEnum.remote
                    console.log("return true")
                    return true;
                }
                return false;
            })
            .catch(function (error) {
                console.log("error", error.data)
                return false;
            });

        console.log("remoteLoginSuccess: ", remoteLoginSuccess, "saveEmail: ", saveEmail)
        if (remoteLoginSuccess && saveEmail) {
            this.electronStore.set("storedEmail", email)
        }
        return remoteLoginSuccess;
    }

    async remoteRegistration(server, email, masterPassword, confirmationPassword, firstName, lastName) {
        console.log("calling remote registration with:", server, email, masterPassword, confirmationPassword, firstName, lastName)
        if (masterPassword !== confirmationPassword) {
            return false;
        }
        let that = this;

        // generate Salt (Stretched email to 16 bytes)
        console.log("calling Crypto.getHKDF with:", email, SECRET, 16)
        const stretchedEmail = await Crypto.getHKDF(email, SECRET, 16);
        // normalize master password
        console.log("normalize")
        const normalizedMasterPassword = masterPassword.normalize('NFKD')
        // stretch master password to 32 bytes
        console.log("Crypto.getHKDF with: ", normalizedMasterPassword, stretchedEmail, 32)
        const stretchedMasterPassword = await Crypto.getHKDF(normalizedMasterPassword, stretchedEmail, 32)
        // create Password Key (Master Key)
        console.log("Crypto.getPBKDF2 with: ", stretchedMasterPassword, stretchedEmail, 100000)
        const passwordKey = Crypto.getPBKDF2(stretchedMasterPassword, stretchedEmail, 100000)

        // create Encryption Key (Stretched Master Key)
        const encryptionKey = await Crypto.getHKDF(passwordKey, stretchedEmail, 32)
        // Generate IV
        const iv = crypto.randomBytes(16).toString('hex');
        // Create SymmetricKey
        const symmetricKey = crypto.randomBytes(32).toString('hex');
        // encrypt Symmetric Key
        console.log("THISCrypto.encrypt with: ", symmetricKey, iv, encryptionKey)
        let { encryptedData} = Crypto.encrypt(symmetricKey, iv, encryptionKey)
        console.log("THISencryptedData", encryptedData)
        const encryptedSymmetricKey = encryptedData
        // create Master Password Hash (Master Password Hash)
        const masterPasswordHash = Crypto.getPBKDF2(passwordKey, stretchedMasterPassword, 1)

        console.log("sending: ", {
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: masterPasswordHash,
            iv: iv,
            encryptedSymmetricKey: encryptedSymmetricKey,
            server: this.getServer(server)
        })
        return axios.post(`${this.getServer(server)}/api/password-manager/user-create`, {
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: masterPasswordHash,
            iv: iv,
            encryptedSymmetricKey: encryptedSymmetricKey
        })
            .then(async function (response) {
                console.log("response?.data:", response?.data)
                if (response?.data?.success === true) {
                    const encryptionIV = await Crypto.getHKDF(symmetricKey, stretchedEmail, 16).then(r => {
                        return r
                    })
                    that.userID = response.data.id
                    that.iv = iv
                    that.localIv = encryptionIV
                    that.symmetricKey = symmetricKey
                    that.loginMode = DBModeEnum.remote;
                    return true;
                }
                return false;
            })
            .catch(function (error) {
                console.log("error", error.data)
                return false;
            });
    }

    async fetchPasswords() {
        let decryptedFetchedPasswords = []
        if (this.loginMode === DBModeEnum.local) {
            let msg = "SELECT * FROM Passwords";
            let fetchedPasswords = await this.databaseConnector.sendMessage(msg)
                .then(result => {
                    console.log("--------------------------------------");
                    console.log("fetchPasswords async", result.response, result.result)
                    if (result.response === true) {
                        return result.result
                    }
                });
            console.log("encrypted Fetched Passwords", fetchedPasswords);
            fetchedPasswords.forEach(pasword => {
                console.log("password", pasword)
                console.log("item: ", pasword['item'])
                let item = JSON.parse(Crypto.decryptPassword(pasword['item'], this.symmetricKey))
                item['id'] = pasword['id'];
                console.log("password", pasword)
                decryptedFetchedPasswords.push(item)
                console.log("decrypted Fetched Passwords", fetchedPasswords);
            })
        } else {
            let fetchedPasswords = await axios.post(`${this.getServer("")}/api/password-manager/password-fetch`, {
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
            console.log("encrypted Fetched Passwords", fetchedPasswords);
            fetchedPasswords.forEach(pasword => {
                console.log("password", pasword)
                console.log("item: ", pasword['item'])
                let item = JSON.parse(Crypto.decryptPassword(pasword['item'], this.symmetricKey))
                item['id'] = pasword['id'];
                console.log("password", pasword)
                decryptedFetchedPasswords.push(item)
                console.log("decrypted Fetched Passwords", fetchedPasswords);
            })
        }
        return decryptedFetchedPasswords

    }

    async addPassword(title, description, url, username, password) {
        let status;

        console.log("calling Crypto.encryptPassword with:", password, this.symmetricKey);
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
        console.log("calling Crypto.encryptPassword with:", JSON.stringify(item), this.symmetricKey);
        let encryptedItem = Crypto.encryptPassword(JSON.stringify(item), this.symmetricKey);
        console.log("result:", encryptedItem);
        if (this.loginMode === DBModeEnum.local) {
            let msg = `INSERT INTO Passwords (item) VALUES ('${encryptedItem}');`
            status = await this.databaseConnector.sendMessage(msg)
                .then(result => {
                    console.log("--------------------------------------");
                    console.log("addSuccess async", result.response)
                    return result.response
                });
        } else {
            status = await axios.post(`${this.getServer("")}/api/password-manager/password-create`, {
                item: encryptedItem,
                userID: this.userID,
            })
                .then(function (response) {
                    console.log("response", response);
                    console.log("response?.data", response?.data);
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
        console.log("calling Crypto.encryptPassword with:", password, this.symmetricKey);
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
        console.log("calling Crypto.encryptPassword with:", JSON.stringify(item), this.symmetricKey);
        let encryptedItem = Crypto.encryptPassword(JSON.stringify(item), this.symmetricKey);

        if (this.loginMode === DBModeEnum.local) {
            let msg = `UPDATE Passwords ` +
                `SET item = '${encryptedItem}'` +
                `WHERE Id = ${id};`
            status = await this.databaseConnector.sendMessage(msg)
                .then(result => {
                    console.log("--------------------------------------");
                    console.log("updatePassword async", result.response)
                    return result.response
                });
        } else {
            status = await axios.post(`${this.getServer("")}/api/password-manager/password-update`, {
                id: id,
                item: encryptedItem,
                userID: this.userID,
            })
                .then(function (response) {
                    console.log("response", response);
                    console.log("response?.data", response?.data);
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
                    console.log("--------------------------------------");
                    console.log("deleteSuccess async", result.response)
                    return result.response
                });
        } else {
            status = await axios.post(`${this.getServer("")}/api/password-manager/password-delete`, {
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
        return status
    }


    async localLogin(password, location) {
        if (isEmpty(location)) {
            location = DEFAULT_LOCAL_DB_LOCATION;
        }
        const localLoginResult = await this.databaseConnector.openDatabase(location, password);
        if (localLoginResult && this.isFirstLogin) {
            this.electronStore.set("defaultView", VIEW_TYPE.localLoginView)
        }
        if (localLoginResult === true) {
            // normalize master password
            console.log("normalize")
            const normalizedMasterPassword = password.normalize('NFKD')
            // stretch master password to 32 bytes
            console.log("Crypto.getHKDF with: ", normalizedMasterPassword, LOCAL_SECRET, 32)
            const stretchedMasterPassword = await Crypto.getHKDF(normalizedMasterPassword, LOCAL_SECRET, 32)
            // create Password Key (Master Key)
            console.log("Crypto.getPBKDF2 with: ", stretchedMasterPassword, LOCAL_SECRET, 100000)
            const passwordKey = Crypto.getPBKDF2(stretchedMasterPassword, LOCAL_SECRET, 100000)
            // create Encryption Key (Stretched Master Key)
            const encryptionKey = await Crypto.getHKDF(passwordKey, LOCAL_SECRET, 32)
            const encryptionIV = await Crypto.getHKDF(passwordKey, LOCAL_SECRET, 16)

            this.loginMode = DBModeEnum.local
            this.localIv = encryptionIV
            this.symmetricKey = encryptionKey
        }
        return localLoginResult;
    }

    async localRegistration(password, location) {
        if (isEmpty(location)) {
            location = DEFAULT_LOCAL_DB_LOCATION;
        } else {
            location = path.resolve(location, DATABASE_FILENAME)
        }
        const localRegistrationResult = this.databaseConnector.createDatabase(location);

        if (localRegistrationResult && this.isFirstLogin) {
            this.electronStore.set("defaultView", VIEW_TYPE.localLoginView)
            this.electronStore.set("customDatabaseLocation", location)
        }
        if (localRegistrationResult === true) {
            // normalize master password
            console.log("normalize")
            const normalizedMasterPassword = password.normalize('NFKD')
            // stretch master password to 32 bytes
            console.log("Crypto.getHKDF with: ", normalizedMasterPassword, LOCAL_SECRET, 32)
            const stretchedMasterPassword = await Crypto.getHKDF(normalizedMasterPassword, LOCAL_SECRET, 32)
            // create Password Key (Master Key)
            console.log("Crypto.getPBKDF2 with: ", stretchedMasterPassword, LOCAL_SECRET, 100000)
            const passwordKey = Crypto.getPBKDF2(stretchedMasterPassword, LOCAL_SECRET, 100000)
            // create Encryption Key (Stretched Master Key)
            const encryptionKey = await Crypto.getHKDF(passwordKey, LOCAL_SECRET, 32)
            const encryptionIV = await Crypto.getHKDF(passwordKey, LOCAL_SECRET, 16)

            this.loginMode = DBModeEnum.local
            this.localIv = encryptionIV
            this.symmetricKey = encryptionKey
        }
        return localRegistrationResult
    }







    // todo delete
    async remoteLogin2(server, email, password, saveEmail) {
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

    async remoteRegistration2(server, email, password, confirmationPassword, firstName, lastName) {
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

    async addPassword2(title, description, url, username, password) {
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

    async updatePassword2(id, title, description, url, username, password) {
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

    async deletePassword2(id) {
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

    async fetchPasswords2() {
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

    // todo end delete

    dbExists() {
        console.log("!isFirstLogin ", !this.isFirstLogin);
        //return !this.isFirstLogin
        return false
    }

    setWin(win) {
        this.win = win
    }

    getDefaultView() {
        return this.electronStore.get("defaultView")
    }

    async decryptPassword(password) {
        return Crypto.decryptPassword(password, this.symmetricKey)
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