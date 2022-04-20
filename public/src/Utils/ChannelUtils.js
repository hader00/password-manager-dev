/*
 * Keep channel names synchronised with:
 * ../Controller/ExtensionController.js
 * ../Controller/ElectronController.js
 * ../Controller/preload.js
 */
const DEFAULT_VIEW_RESPONSE = 'defaultView:response';
const DEFAULT_VIEW_CALL = 'defaultView:get';

const PASSWORD_DECRYPT_RESPONSE = 'password:decryptResponse';
const PASSWORD_DECRYPT_CALL = 'password:decrypt';

const PASSWORD_GENERATE_RESPONSE = 'password:generateResponse';
const PASSWORD_GENERATE_CALL = 'password:generate';

const PASSWORD_ADD_RESPONSE = 'passwords:addResponse';
const PASSWORD_ADD_CALL = 'passwords:add';

const PASSWORD_UPDATE_RESPONSE = 'passwords:updateResponse';
const PASSWORD_UPDATE_CALL = 'passwords:update';

const PASSWORD_DELETE_RESPONSE = 'passwords:deleteResponse';
const PASSWORD_DELETE_CALL = 'passwords:delete';

const PASSWORD_FETCH_RESPONSE = 'passwords:fetchResponse';
const PASSWORD_FETCH_CALL = 'passwords:fetch';

const SECURITY_RESPONSE = 'security:response';
const SECURITY_CALL = 'security:get';

const LOGOUT_CALL = 'logout:set';

const LOCAL_LOGIN_RESPONSE = 'localLogin:response';
const LOCAL_LOGIN_CALL = 'localLogin:login';

const LOCAL_REGISTRATION_RESPONSE = 'localLogin:registerResponse';
const LOCAL_REGISTRATION_CALL = 'localLogin:register';

const REMOTE_LOGIN_RESPONSE = 'remoteLogin:response';
const REMOTE_LOGIN_CALL = 'remoteLogin:login';

const REMOTE_REGISTRATION_RESPONSE = 'remoteRegistration:response';
const REMOTE_REGISTRATION_CALL = 'remoteRegistration:register';

const EMAIL_RESPONSE = 'email:response';
const EMAIL_CALL = 'email:get';

const DB_RESPONSE = 'database:response';
const DB_CALL = 'database:get';

const SERVER_RESPONSE = 'server:getResponse';
const SERVER_CALL = 'server:get';

const SERVER_AVAILABILITY_RESPONSE = 'server:response';
const SERVER_AVAILABILITY_CALL = 'server:check';

const DEFAULT_SECURITY_RESPONSE = 'security:setResponse';
const DEFAULT_SECURITY_CALL = 'security:set';

const EXPORT_RESPONSE = 'export:response';
const EXPORT_CALL = 'export:items';

const MODE_RESPONSE = 'mode:response';
const MODE_CALL = 'mode:get';

const BROWSER_RESPONSE = 'browser:response';
const BROWSER_CALL = 'browser:open';

const FILE_DIALOG_RESPONSE = 'selectDatabase:response';
const FILE_DIALOG_CALL = 'selectDatabase:get';

const FOLDER_DIALOG_RESPONSE = 'selectFolder:response';
const FOLDER_DIALOG_CALL = 'selectFolder:get';

const MENU_LOGOUT_CALL = 'menu:logout';
const MENU_SAVE_CALL = 'menu:saveItem';
const MENU_DELETE_CALL = 'menu:deleteItem';
const MENU_NEW_CALL = 'menu:newItem';
const MENU_EXPORT_CALL = 'menu:exportItems';
const MENU_ACCOUNT_CALL = 'menu:account';

module.exports = {
    DEFAULT_VIEW_RESPONSE,
    DEFAULT_VIEW_CALL,
    PASSWORD_DECRYPT_RESPONSE,
    PASSWORD_DECRYPT_CALL,
    PASSWORD_GENERATE_RESPONSE,
    PASSWORD_GENERATE_CALL,
    PASSWORD_ADD_RESPONSE,
    PASSWORD_ADD_CALL,
    PASSWORD_UPDATE_RESPONSE,
    PASSWORD_UPDATE_CALL,
    PASSWORD_DELETE_RESPONSE,
    PASSWORD_DELETE_CALL,
    PASSWORD_FETCH_RESPONSE,
    PASSWORD_FETCH_CALL,
    SECURITY_RESPONSE,
    SECURITY_CALL,
    LOGOUT_CALL,
    LOCAL_LOGIN_RESPONSE,
    LOCAL_LOGIN_CALL,
    LOCAL_REGISTRATION_RESPONSE,
    LOCAL_REGISTRATION_CALL,
    REMOTE_LOGIN_RESPONSE,
    REMOTE_LOGIN_CALL,
    REMOTE_REGISTRATION_RESPONSE,
    REMOTE_REGISTRATION_CALL,
    EMAIL_RESPONSE,
    EMAIL_CALL,
    DB_RESPONSE,
    DB_CALL,
    SERVER_RESPONSE,
    SERVER_CALL,
    SERVER_AVAILABILITY_RESPONSE,
    SERVER_AVAILABILITY_CALL,
    DEFAULT_SECURITY_RESPONSE,
    DEFAULT_SECURITY_CALL,
    EXPORT_RESPONSE,
    EXPORT_CALL,
    MODE_RESPONSE,
    MODE_CALL,
    BROWSER_RESPONSE,
    BROWSER_CALL,
    FILE_DIALOG_RESPONSE,
    FILE_DIALOG_CALL,
    FOLDER_DIALOG_RESPONSE,
    FOLDER_DIALOG_CALL,
    MENU_LOGOUT_CALL,
    MENU_SAVE_CALL,
    MENU_DELETE_CALL,
    MENU_NEW_CALL,
    MENU_EXPORT_CALL,
    MENU_ACCOUNT_CALL
}