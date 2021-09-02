const path = require('path');
const {app} = require('electron');
const fs = require('fs');

const DBModeEnum = {
    local: 0,
    remote: 1
};

const ENCRYPTED_EXTENSION = ".out.encrypted";
const DATABASE_FILENAME = "passwords.db";
const DEFAULT_LOCAL_DB_LOCATION = path.resolve(app.getPath('userData'), 'passwords.db');
const ALGORITHM = 'aes-256-cbc';
const MYSQL_CONFIG = {
    user: 'root',
    host: 'localhost',
    password: 'root',
    database: 'passwordManagerDB'
}
// todo is a duplicate
const VIEW_TYPE = {
    defaultLoginView: "login",
    localLoginView: "local",
    localRegistrationView: "local-registration",
    registrationView: "registration",
    passwordListView: "passwordList",
};

function isEmpty(item) {
    return item === undefined || item === null || item === "" || item === 'undefined'
}

module.exports = { DBModeEnum, ENCRYPTED_EXTENSION, DEFAULT_LOCAL_DB_LOCATION, ALGORITHM, MYSQL_CONFIG, VIEW_TYPE, DATABASE_FILENAME, isEmpty };