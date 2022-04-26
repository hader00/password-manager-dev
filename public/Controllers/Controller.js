const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const {Crypto} = require("../src/Crypto");
const {ElectronStore} = require("../src/ElectronStore");
const {DatabaseConnector} = require("../src/DatabaseConnector");
const PMUtils = require("../src/Utils/PMUtils");
const {PasswordGenerator} = require("../src/PasswordGenerator");
const axios = require('axios');

/**
 * Controller object that describes functionally for electron and extension
 *
 * The class handles remote registration and login, local database creation and login, password fetching,
 * password encryption, password decryption
 *
 */
class Controller {
    constructor() {
        this.electronStore = new ElectronStore();
        this.databaseConnector = new DatabaseConnector();
        this.loginMode = null;
        this.server = null;
        this.userID = null;
        this.passwordKey = null;
        this.symmetricKey = null;
        this.customDatabaseLocation = null;

        if (!this.electronStore.has(PMUtils.DEFAULT_VIEW)) {
            this.electronStore.set(PMUtils.DEFAULT_VIEW, PMUtils.VIEW_TYPE.defaultLoginView);
        }
    }

    /*
     * Remote registration function
     * This function does following steps:
     * 1) Check if masterPassword and confirmationPassword are identical
     * 2) Generate security keys
     * 2.1) Stretch email with HKDF, will be used as salt
     * 2.2) Normalize masterPassword to NFKD
     * 2.3) Generate 'stretchedMasterPassword' with HKDF, from normalized masterPassword
     * 2.4) Generate 'passwordKey' with PBKDF2, hash of stretchedMasterPassword, from which other hashes will be generated
     * 2.5) Generate 'masterPasswordHash' with PBKDF2, will be sent to server and later used for authentication
     * 2.6) Generate 'encryptionKey' with PBKDF2, will used for database encryption/decryption
     * 3) Generate 'symmetricKey' and 'iv' which will encrypt 'encryptionKey', 'symmetricKey' and 'iv' will be sent to server
     * 4) Check server (use default if custom is null)
     * 5) Call the server, wait for response
     * 6) Save required data
     *
     * @param  server                   null|String     a server which user chooses
     * @param  email                    String          a user's email
     * @param  masterPassword           String          a user's master password
     * @param  confirmationPassword     String          a user's master password (should be same as masterPassword)
     * @param  firstName                String          a user's first name
     * @param  lastName                 String          a user's last name
     *
     * @return  Bool    success of remote registration
     */
    async remoteRegistration(server, email, masterPassword, confirmationPassword, firstName, lastName) {
        if (masterPassword !== confirmationPassword) {
            return false;
        }

        const {passwordKey, masterPasswordHash, encryptionKey} = await this.computeSecurityKeys(email, masterPassword);
        // Create encryption key for database
        let {iv, symmetricKey, encryptedData} = this.generateEncryptionKeys(encryptionKey);
        // Check if server valid
        const currentServer = this.getServer(server)
        let that = this;
        return await axios.post(`${currentServer}${PMUtils.API_CREATE_USER}`, {
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: masterPasswordHash,
            iv: iv,
            encryptedSymmetricKey: encryptedData,
        })
            .then(async function (response) {
                if (response?.data?.success === true) {
                    that.setLoginData(currentServer, response.data.id, passwordKey, symmetricKey, PMUtils.DBModeEnum.remote, email);
                    return true;
                }
                return false;
            })
            .catch(function (error) {
                console.log(PMUtils.REGISTRATION_ERR, error.data)
                return false;
            })
    }

    /*
     * Remote login function
     * This function does following steps:
     * 1) Generate security keys
     * 1.1) Stretch email with HKDF, will be used as salt
     * 1.2) Normalize masterPassword to NFKD
     * 1.3) Generate 'stretchedMasterPassword' with HKDF, from normalized masterPassword
     * 1.4) Generate 'passwordKey' with PBKDF2, hash of stretchedMasterPassword, from which other hashes will be generated
     * 1.5) Generate 'masterPasswordHash' with PBKDF2, will be sent to server and later used for authentication
     * 1.6) Generate 'encryptionKey' with PBKDF2, will used for database encryption/decryption
     * 2) Check server (use default if custom is null)
     * 3) Call the server, wait for response, fetch encryptionKey
     * 4) Save required data
     *
     * @param  server                   null|String     a server which user chooses
     * @param  email                    String          a user's email
     * @param  masterPassword           String          a user's master password
     * @param  saveEmail                String          if user wants to save email - todo
     *
     * @return  Bool    success of remote login
     */
    async remoteLogin(server, email, masterPassword, saveEmail) {
        const {passwordKey, masterPasswordHash, encryptionKey} = await this.computeSecurityKeys(email, masterPassword);
        // Check if server valid
        const currentServer = this.getServer(server)

        let that = this;
        return await axios.post(`${currentServer}${PMUtils.API_LOGIN_USER}`, {
            email: email,
            password: masterPasswordHash
        })
            .then(async function (response) {
                if (response?.data?.success === true) {
                    const {decryptedData} = Crypto.decrypt(response.data.encryptedSymmetricKey, response.data.iv, encryptionKey)
                    that.setLoginData(currentServer, response.data.id, passwordKey, decryptedData, PMUtils.DBModeEnum.remote, email);
                    return true;
                }
                return false;
            })
            .catch(function (error) {
                console.log(PMUtils.LOGIN_ERR, error)
                return false;
            });
    }

    /*
     * Local registration function
     * This function does following steps:
     * 1) Check location (use default if custom is null)
     * 2) Create database, setup tables in database
     * 1.1) Use PMUtils.LOCAL_SECRET as salt
     * 1.2) Normalize masterPassword to NFKD
     * 1.3) Generate 'stretchedMasterPassword' with HKDF, from normalized masterPassword
     * 1.4) Generate 'passwordKey' with PBKDF2, hash of stretchedMasterPassword, from which other hashes will be generated
     * 1.5) Generate 'masterPasswordHash' with PBKDF2, will be sent to server and later used for authentication
     * 1.6) Generate 'encryptionKey' with PBKDF2, will used for database encryption/decryption
     * 3) Set authentication data to the database
     * 4) Save required data
     *
     * @param  location                 null|String     a location of user's database (path to folder)
     * @param  password                 String          a user's master password
     *
     * @return  Bool    success of local registration
     */
    async localRegistration(password, location) {
        if (PMUtils.isEmpty(location)) {
            location = PMUtils.DEFAULT_LOCAL_DB_LOCATION;
        } else {
            location = path.resolve(location, PMUtils.DATABASE_FILENAME)
        }
        const databaseCreated = await this.databaseConnector.createDatabase(location);
        if (databaseCreated === true) {
            const {passwordKey, masterPasswordHash, encryptionKey} = await this.computeSecurityKeys("", password);
            let msg = `INSERT INTO Validation (item) VALUES ('${masterPasswordHash}');`
            await this.databaseConnector.sendMessage(msg)
                .then(result => {
                    return result.response
                });
            this.setLoginData(null, null, passwordKey, encryptionKey, PMUtils.DBModeEnum.local, location)
        }
        return databaseCreated
    }

    /*
    * Local login function
    * This function does following steps:
    * 1) Check location (use default if custom is null)
    * 2) Open database
    * 1.1) Use PMUtils.LOCAL_SECRET as salt
    * 1.2) Normalize masterPassword to NFKD
    * 1.3) Generate 'stretchedMasterPassword' with HKDF, from normalized masterPassword
    * 1.4) Generate 'passwordKey' with PBKDF2, hash of stretchedMasterPassword, from which other hashes will be generated
    * 1.5) Generate 'masterPasswordHash' with PBKDF2, will be sent to server and later used for authentication
    * 1.6) Generate 'encryptionKey' with PBKDF2, will used for database encryption/decryption
    * 3) Fetch authentication data from the database and compare
    * 4) Save required data
    *
    * @param  location                 null|String     a location of user's database (path to folder)
    * @param  password                 String          a user's master password
    *
    * @return  Bool    success of local login
    */
    async localLogin(password, location) {
        if (PMUtils.isEmpty(location)) {
            location = PMUtils.DEFAULT_LOCAL_DB_LOCATION;
        }
        let databaseConnected = await this.databaseConnector.openDatabase(location, password);
        if (databaseConnected === true) {
            const {passwordKey, masterPasswordHash, encryptionKey} = await this.computeSecurityKeys("", password);
            let msg = "SELECT * FROM Validation";
            let fetchedValidation = await this.databaseConnector.sendMessage(msg)
                .then(result => {
                    if (result.response === true) {
                        return result.result[0]
                    } else {
                        return result.response
                    }
                });
            // Validate Login
            if (fetchedValidation['item'] === masterPasswordHash) {
                this.setLoginData(null, null, passwordKey, encryptionKey, PMUtils.DBModeEnum.local, location)
            } else {
                databaseConnected = false
            }
        }
        return databaseConnected;
    }

    /*
    * setLoginData function
    * This function saves required data (password and encryption keys), which are used to manipulate with database
    *
    * @param  currentServer            null|String     a server which will be used for communication, null if local
    * @param  userID                   null|String     a user's id in remote database
    * @param  passwordKey              String          a hash of stretched and normalized master password, will be used for export check
    * @param  symmetricKey             String          a key under which the database is encrypted
    * @param  loginMode                String          current login mode
    * @param  emailOrDatabaseLoc       String          a user's email or database location saved for next application login
    */
    setLoginData(currentServer, userID, passwordKey, symmetricKey, loginMode, emailOrDatabaseLoc) {
        this.server = currentServer
        this.userID = userID
        this.passwordKey = passwordKey
        this.symmetricKey = symmetricKey
        this.loginMode = loginMode
        if (loginMode === PMUtils.DBModeEnum.remote) {
            this.electronStore.set(PMUtils.DEFAULT_VIEW, PMUtils.VIEW_TYPE.defaultLoginView)
            this.electronStore.set(PMUtils.STORED_EMAIL, emailOrDatabaseLoc)
        } else {
            this.electronStore.set(PMUtils.DEFAULT_VIEW, PMUtils.VIEW_TYPE.localLoginView)
            this.electronStore.set(PMUtils.CUSTOM_DB_LOC, emailOrDatabaseLoc)
        }
    }

    /*
    * Fetch passwords function
    * This function asks for all passwords from the server or from local database.
    * Each password item is encrypted, after the fetch all are decrypted and sent to the front-end application.
    *
    * @return  Array    an array of decrypted password items
    */
    async fetchPasswords() {
        let decryptedFetchedPasswords = []
        let fetchedPasswords
        if (this.loginMode === PMUtils.DBModeEnum.local) {
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
            fetchedPasswords = await axios.post(`${this.server}${PMUtils.API_FETCH_PASS}`, {
                userID: this.userID,
            })
                .then(function (response) {
                    return response.data
                })
                .catch(function (error) {
                    return []
                });
        }
        if (fetchedPasswords.length > 0) {
            fetchedPasswords.forEach(password => {
                const {slicedIV, slicedPassword} = this.sliceIvAndPassword(password['item']);
                let {decryptedData} = Crypto.decrypt(slicedPassword, slicedIV, this.symmetricKey)
                decryptedData = JSON.parse(decryptedData)
                decryptedData['id'] = password['id'];
                decryptedFetchedPasswords.push(decryptedData)
            })
        }
        return decryptedFetchedPasswords

    }

    /*
    * Add password function
    * This function encrypts and adds new password to the database (remote or local).
    *
    * @param  title             String          a title
    * @param  description       String          a description
    * @param  url               String          an url
    * @param  username          String          an username
    * @param  password          String          a password, the password is encrypted again within the whole password item
    *
    * @return  status    a state of password saving
    */
    async addPassword(title, description, url, username, password) {
        let status;
        const encryptedItem = this.encryptPassword(password, title, description, url, username);
        if (this.loginMode === PMUtils.DBModeEnum.local) {
            let msg = `INSERT INTO Passwords (item) VALUES ('${encryptedItem}');`
            status = await this.databaseConnector.sendMessage(msg)
                .then(result => {
                    return result.response
                });
        } else {
            status = await axios.post(`${this.server}${PMUtils.API_CREATE_PASS}`, {
                item: encryptedItem,
                userID: this.userID,
            })
                .then(function (response) {
                    return response?.data?.success;
                })
                .catch(function (error) {
                    console.log(PMUtils.PASS_CREATE_ERR, error);
                    return false
                })
        }
        return status
    }

    /*
    * Update password function
    * This function updates existing password in the database (remote or local).
    *
    * @param  id                Number|String   an id of password in users database
    * @param  title             String          a title
    * @param  description       String          a description
    * @param  url               String          an url
    * @param  username          String          an username
    * @param  password          String          a password, the password is encrypted again within the whole password item
    *
    * @return  status    a state of password update
    */
    async updatePassword(id, title, description, url, username, password) {
        let status;
        const encryptedItem = this.encryptPassword(password, title, description, url, username);
        if (this.loginMode === PMUtils.DBModeEnum.local) {
            let msg = `UPDATE Passwords ` +
                `SET item = '${encryptedItem}'` +
                `WHERE Id = ${id};`
            status = await this.databaseConnector.sendMessage(msg)
                .then(result => {
                    return result.response
                });
        } else {
            status = await axios.post(`${this.server}${PMUtils.API_UPDATE_PASS}`, {
                id: id,
                item: encryptedItem,
                userID: this.userID,
            })
                .then(function (response) {
                    return response?.data?.success;
                })
                .catch(function (error) {
                    console.log(PMUtils.PASS_UPDATE_ERR, error);
                    return false
                })
        }
        return status
    }

    /*
    * Delete password function
    * This function deletes existing password in the database (remote or local).
    *
    * @param  id                Number|String   an id of password in users database
    *
    * @return  status    a state of password delete
    */
    async deletePassword(id) {
        let status;
        if (this.loginMode === PMUtils.DBModeEnum.local) {
            let msg = `DELETE FROM Passwords WHERE id = ${id}`;
            status = await this.databaseConnector.sendMessage(msg)
                .then(result => {
                    return result.response
                });
        } else {
            status = await axios.post(`${this.server}${PMUtils.API_DELETE_PASS}`, {
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

    /*
    * Export password function
    * 1) This function does check if user's credentials are valid
    * 2) Fetches for all passwords and decrypts them
    * 3) Creates a cvs object
    * 4) Creates a file in choosen location in format: 'date' + 'time' + '.cvs'
    * 5) Writes all passwords to the cvs file
    *
    * @param  password             String           a master password
    * @param  email                null|String      an user's email (for remote)
    * @param  location             String           a path for export
    *
    * @return  status    a state of password export
    */
    async exportPasswords(password, email, location) {
        let {passwordKey} = this.computeSecurityKeys("", password)
        if (passwordKey !== this.passwordKey) {
            return false;
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
        const timeDate = date.toISOString().slice(0, 19).replace(/-/g, "").replace(/T/g, "").replace(/:/g, "");
        fs.writeFileSync(location + `/${timeDate}.csv`, result);
        return true
    }

    /*
    * Encrypt password function
    * This function updates encrypts password and the whole item, with symmetricKey
    *
    * @param  title             String          a title
    * @param  description       String          a description
    * @param  url               String          an url
    * @param  username          String          an username
    * @param  password          String          a password, the password is encrypted again within the whole password item
    *
    * @return  status    a state of password encryption
    */
    encryptPassword(password, title, description, url, username) {
        if (!PMUtils.isEmpty(password)) {
            let {iv, encryptedData} = Crypto.encrypt(password, this.symmetricKey);
            password = iv.concat(encryptedData);
        }
        let item = {
            title: title,
            description: description,
            url: url,
            username: username,
            password: password
        }
        let {iv, encryptedData} = Crypto.encrypt(JSON.stringify(item), this.symmetricKey);
        return iv.concat(encryptedData);
    }

    // Split iv and password from the whole item
    sliceIvAndPassword(password) {
        const slicedIV = Buffer.from(password.slice(0, 32), "hex");
        const slicedPassword = Buffer.from(password.slice(32, password.length), "hex");
        return {slicedIV, slicedPassword};
    }

    /*
   * Compute security keys function
   * This function computes all crypto keys and hashes used for authentication and encryption/decryption
   * 1) Stretch email, with HKDF (in remote mode) to be used as hash, or use PMUtils.LOCAL_SECRET (in local mode)
   * 2) Normalize master password to 'NKDF'
   * 3) Stretch normalized master password with HKDF
   * 3) Generate 'passwordKey', with PBKDF2 a hash from which other keys and hashes are derived
   * 4) Generate 'masterPasswordHash', with PBKDF2 a hash from passwordKey, used for authentication
   * 5) Generate 'encryptionKey' with HKDF a key from passwordKey, used for encryption/decryption
   *
   *
   * @param  email             null|String     an email
   * @param  masterPassword    String          a masterPassword
   *
   * @return passwordKey            object     a hash of stretched and normalized master password
   * @return masterPasswordHash     object     a hash of passwordKey, used for authentication
   * @return encryptionKey          object     a key under which a symmetricKey is encrypted
   */
    async computeSecurityKeys(email, masterPassword) {
        let salt
        if (PMUtils.isEmpty(email)) {
            salt = PMUtils.LOCAL_SECRET;
        } else {
            // generate Salt (Stretched email to 16 bytes)
            salt = await Crypto.getHKDF(email, PMUtils.SECRET, 16, PMUtils.ENCRYPTION_KEY_INFO);
        }
        // normalize master password
        const normalizedMasterPassword = masterPassword.normalize(PMUtils.NKDF)
        // stretch master password to 32 bytes
        const stretchedMasterPassword = await Crypto.getHKDF(normalizedMasterPassword, salt, 32, PMUtils.ENCRYPTION_KEY_INFO)
        // create Password Key (Master Key)
        const passwordKey = Crypto.getPBKDF2(stretchedMasterPassword, salt, 100000)
        // create Master Password Hash (Master Password Hash)
        const masterPasswordHash = Crypto.getPBKDF2(passwordKey, stretchedMasterPassword, 1)
        // create Encryption Key (Stretched Master Key)
        const encryptionKey = await Crypto.getHKDF(passwordKey, salt, 32, PMUtils.ENCRYPTION_KEY_INFO)
        return {passwordKey, masterPasswordHash, encryptionKey};
    }

    /*
      * Generate encryption keys function
      * This does generate a unique key ('symmetricKey') under which a database is encrypted
      * The 'symmetricKey' is then encrypted with 'encryptionKey'
      * The encrypted symmetricKey and iv will be sent to server and retrieved after successful login,
      *
      * @param  encryptionKey       String          a key used for encryption
      *
      * @return iv                  String     an unique iv used in encryption
      * @return symmetricKey        String     an unencrypted symmetricKey used for databse encryption/decryption
      * @return encryptedData       String     an encrypted symmetricKey which will be sent to server
      */
    generateEncryptionKeys(encryptionKey) {
        // Create SymmetricKey
        const symmetricKey = crypto.randomBytes(32).toString('hex');
        // encrypt Symmetric Key
        let {iv, encryptedData} = Crypto.encrypt(symmetricKey, encryptionKey)
        return {iv, symmetricKey, encryptedData};
    }

    // Get security timeouts (logout and clipboard clear)
    getStoredSecurity() {
        const clearTimeout = this.electronStore.get(PMUtils.CLEAR_TIMEOUT)
        const logoutTimeout = this.electronStore.get(PMUtils.LOGOUT_TIMEOUT)
        return {clearTimeout: clearTimeout, logoutTimeout: logoutTimeout}
    }

    // Set security timeouts  (logout and clipboard clear)
    setDefaultSecurity(timeouts) {
        this.electronStore.set(PMUtils.CLEAR_TIMEOUT, timeouts['clipboardTime'])
        this.electronStore.set(PMUtils.LOGOUT_TIMEOUT, timeouts['time'])
        return true
    }

    // Decrypt password
    async decryptPassword(password) {
        if (!PMUtils.isEmpty(password)) {
            // Split IV and encryptedPassword
            const {slicedIV, slicedPassword} = this.sliceIvAndPassword(password);
            let {decryptedData} = Crypto.decrypt(slicedPassword, slicedIV, this.symmetricKey)
            return decryptedData
        } else {
            return password
        }
    }

    // Generate password
    async generatePassword(length, specialCharacters, numbers, lowerCase, upperCase) {
        return PasswordGenerator.generatePassword(length, specialCharacters, numbers, lowerCase, upperCase);
    }

    // Get previously used custom server
    getServer(server) {
        if (PMUtils.isEmpty(server)) {
            server = PMUtils.SERVER;
        }
        return server
    }

    // Get stored default views, local if last login was local, remote if last login was remote
    getDefaultView() {
        if (this.userID !== null) {
            return PMUtils.VIEW_TYPE.passwordListView
        } else {
            return this.electronStore.get(PMUtils.DEFAULT_VIEW)
        }
    }

    // Get previously used email
    async getStoredEmail() {
        let email = ""
        if (this.electronStore.has(PMUtils.STORED_EMAIL)) {
            email = await this.electronStore.get(PMUtils.STORED_EMAIL);
        }
        return email;
    }

    // Get previously used database location, if user doesn't use default DB location
    async getStoredDatabaseLocation() {
        let databaseLocation = ""
        if (this.electronStore.has(PMUtils.CUSTOM_DB_LOC)) {
            databaseLocation = await this.electronStore.get(PMUtils.CUSTOM_DB_LOC);
        }
        if (databaseLocation === PMUtils.DEFAULT_LOCAL_DB_LOCATION) {
            return ""
        } else {
            return databaseLocation
        }
    }

    // Get previously used database server, if user doesn't use default server
    async getStoredServer() {
        let server = ""
        if (this.electronStore.has(PMUtils.STORED_SERVER)) {
            server = await this.electronStore.get(PMUtils.STORED_SERVER);
        }
        if (server === PMUtils.SERVER) {
            return ""
        } else {
            return server
        }
    }

    // Check for server validity by calling server api
    async isServerValid(server) {
        return await axios.get(`${server}${PMUtils.API_AVAILABLE}`).then((res) => {
            if (res.data.success) {
                // Save server if not saved before
                if (!this.electronStore.has(PMUtils.STORED_SERVER)) {
                    this.electronStore.set(PMUtils.STORED_SERVER, server)
                }
                return true
            }
            return false
        }).catch((err) => {
            console.log(PMUtils.SERVER_VALID_ERR, err)
            return false
        })
    }

    // Return actual login mode: remote or local
    getLoginMode() {
        return this.loginMode
    }

    // Remove electron store data
    clearElectronStoreData() {
        this.electronStore.set(PMUtils.DEFAULT_VIEW, null)
        this.electronStore.set(PMUtils.STORED_EMAIL, "")
        this.electronStore.set(PMUtils.STORED_SERVER, "")
        this.electronStore.set(PMUtils.CLEAR_TIMEOUT, "10")
        this.electronStore.set(PMUtils.LOGOUT_TIMEOUT, "5")
        this.electronStore.set(PMUtils.CUSTOM_DB_LOC, null)
    }

    // Logout and clean data saved by application
    logoutImmediate() {
        this.loginMode = null;
        this.server = null;
        this.userID = null;
        this.passwordKey = null;
        this.symmetricKey = null;
        this.customDatabaseLocation = null;
    }
}

module.exports = {Controller}