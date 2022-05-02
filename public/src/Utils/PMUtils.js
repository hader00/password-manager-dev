const path = require('path');
const {app} = require('electron');

/* API */
const SERVER = "https://password-manager-mysql.herokuapp.com";
const API_CREATE_USER = "/api/password-manager/user-create";
const API_LOGIN_USER = "/api/password-manager/user-login";
const API_CREATE_PASS = "/api/password-manager/password-create";
const API_UPDATE_PASS = "/api/password-manager/password-update";
const API_DELETE_PASS = "/api/password-manager/password-delete";
const API_FETCH_PASS = "/api/password-manager/password-fetch";
const API_AVAILABLE = "/available";
/* END API */

/* Controller */
const GIT_REPO = "https://github.com/hader00/password-manager-dev";
const STRETCH_SALT_INFO = "stretchedSaltInfo";
const STRETCH_MASTER_PASS_INFO = "stretchedMasterPassInfo";
const ENCRYPTION_KEY_INFO = "encryptionKeyInfo";
const NKDF = "NFKD";
const DATABASE_FILENAME = "passwords.db";
const TSV = ".tsv"
const DB = ".db"
const DEFAULT_LOCAL_DB_LOCATION = path.resolve(app.getPath("userData"), DATABASE_FILENAME);
const DBModeEnum = {
    local: 0,
    remote: 1
};
const VIEW_TYPE = {
    accountView: "account",
    defaultLoginView: "login",
    localLoginView: "local",
    localRegistrationView: "local-registration",
    registrationView: "registration",
    passwordListView: "passwordList",
};

function isEmpty(item) {
    return item === "" || item === null || item === "null" || item === undefined || item === "undefined";
}

//
const DEFAULT_VIEW = "defaultView";
const STORED_EMAIL = "userEmail";
const CUSTOM_DB_LOC = "customDatabaseLocation";
const CLEAR_TIMEOUT = "clearTimeout";
const LOGOUT_TIMEOUT = "logoutTimeout";
const STORED_SERVER = "storedServer";
/* END Controller */

/* Crypto */
const ALGORITHM = "aes-256-cbc";
const SHA256 = "sha256";
const SHA512 = "sha512";
const HKDF_SHA512 = "SHA-512";
/* END Crypto */

/* Password Generator */
const SPECIAL_CHARACTERS = "!\"#$%'()*+,-./:;<=>?@[\\]^_`{|}~";
const NUMBERS = "123456789";
const LOWER_CASE = "abcdefghijklmnopqrstuvwxyz";
const UPPER_CASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
/* END Password Generator */

/* Error */
const DB_OPEN_ERR = "Database opening error: ";
const BD_CLOSE_ERR = "Database closing error: ";
const REGISTRATION_ERR = "Registration error: ";
const LOGIN_ERR = "Login error: ";
const PASS_CREATE_ERR = "Creating password error: ";
const PASS_UPDATE_ERR = "Updating password error: ";
const SERVER_VALID_ERR = "Server validity error: ";
/* END Error */

/* Info */
const BD_CLOSE_INFO = "Closed the database connection. ";
/* END Info */


module.exports = {
    SERVER,
    API_CREATE_USER,
    API_LOGIN_USER,
    API_CREATE_PASS,
    API_UPDATE_PASS,
    API_DELETE_PASS,
    API_FETCH_PASS,
    API_AVAILABLE,
    //
    GIT_REPO,
    STRETCH_SALT_INFO,
    STRETCH_MASTER_PASS_INFO,
    ENCRYPTION_KEY_INFO,
    NKDF,
    DATABASE_FILENAME,
    TSV,
    DB,
    DEFAULT_LOCAL_DB_LOCATION,
    DBModeEnum,
    VIEW_TYPE,
    isEmpty,
    //
    DEFAULT_VIEW,
    STORED_EMAIL,
    CUSTOM_DB_LOC,
    CLEAR_TIMEOUT,
    LOGOUT_TIMEOUT,
    STORED_SERVER,
    //
    ALGORITHM,
    SHA256,
    SHA512,
    HKDF_SHA512,
    //
    SPECIAL_CHARACTERS,
    NUMBERS,
    LOWER_CASE,
    UPPER_CASE,
    //
    DB_OPEN_ERR,
    BD_CLOSE_ERR,
    REGISTRATION_ERR,
    LOGIN_ERR,
    PASS_CREATE_ERR,
    PASS_UPDATE_ERR,
    SERVER_VALID_ERR,
    //
    BD_CLOSE_INFO
};