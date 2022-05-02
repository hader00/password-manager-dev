/**
 * ViewType
 * Provides names of views for view switching
 */
const ViewType = {
    accountView: "account",
    defaultLoginView: "login",
    localLoginView: "local",
    localRegistrationView: "local-registration",
    registrationView: "registration",
    passwordListView: "passwordList",
    passwordItem: "passwordItem",
};

const EMPTY_STRING = "";
const HTTP = "http";
const HTTPS = "https";
const PREFIX = "://";
const FAVICON = "/favicon.ico";
const COLON = ":";
const SPACE = " ";
const PASSWORD_REGEX = /(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[0-9])(?=.*?[!"#$%'()*+,-./:;<=>?@[\\\]^_`{|}~]).{8,}/

module.exports = {
    EMPTY_STRING,
    HTTP,
    HTTPS,
    PREFIX,
    FAVICON,
    COLON,
    SPACE,
    PASSWORD_REGEX,
    ViewType,
}