const path = require('path');
const {app} = require('electron');

const DBModeEnum = {
    local: 0,
    remote: 1
};

const ENCRYPTED_EXTENSION = ".out.encrypted";
const DATABASE_FILENAME = "passwords.db";
const DEFAULT_LOCAL_DB_LOCATION = path.resolve(app.getPath('userData'), 'passwords.db');
const ALGORITHM = 'aes-256-cbc';
const SHA512 = 'sha512';
const SECRET = "3cfd65492db0040a7ba42f0059fc6ca8"
const LOCAL_SECRET = "5353539c3ae126022b7c11f1ff927ed0"
// todo is a duplicate
const VIEW_TYPE = {
    accountView: "account",
    defaultLoginView: "login",
    localLoginView: "local",
    localRegistrationView: "local-registration",
    registrationView: "registration",
    passwordListView: "passwordList",
};

function isEmpty(item) {
    return item === undefined || item === null || item === "" || item === 'undefined'
}

module.exports = {
    DBModeEnum,
    ENCRYPTED_EXTENSION,
    DEFAULT_LOCAL_DB_LOCATION,
    SHA512,
    SECRET,
    LOCAL_SECRET,
    ALGORITHM,
    VIEW_TYPE,
    DATABASE_FILENAME,
    isEmpty
};