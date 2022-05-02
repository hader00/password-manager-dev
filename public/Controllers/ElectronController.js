const {ipcMain, shell} = require('electron')
const ChannelUtils = require("../src/Utils/ChannelUtils");
const PMUtils = require("../src/Utils/PMUtils");

/**
 * ElectronController object initialize listeners for ipcMain messaging, required
 * for React application.
 *
 * @param  controller  a class providing application functionality
 * @param  win  a class electron BrowserWindow functionality
 */
class ElectronController {
    constructor(controller, win) {
        this.controller = controller;
        this.win = win;
        this.init().then(r => {
            return r
        });
    }

    init() {
        return new Promise((resolve, reject) => {
            try {
                // ********* ipcMain messaging ********* //
                //
                // Note: Ensure that you have added new ipcRenderer.once('channel', ()=>{}) to
                // preload.js when editing this file
                //
                // ********* shared messages with extension ********* //
                // Get stored default view (open local login view, if local database was used previously)
                ipcMain.on(ChannelUtils.DEFAULT_VIEW_CALL, (e) => {
                    const defaultView = this.controller.getDefaultView();
                    e.sender.send(ChannelUtils.DEFAULT_VIEW_RESPONSE, {defaultView: defaultView});
                });
                // Decrypt password from currently viewed password item
                ipcMain.on(ChannelUtils.PASSWORD_DECRYPT_CALL, async (e, password) => {
                    const decryptedPassword = await this.controller.decryptPassword(password);
                    e.sender.send(ChannelUtils.PASSWORD_DECRYPT_RESPONSE, {password: decryptedPassword});
                });
                // Generate new password with custom options
                ipcMain.on(ChannelUtils.PASSWORD_GENERATE_CALL, async (e, length, specialCharacters, numbers, lowerCase, upperCase) => {
                    const generatedPassword = await this.controller.generatePassword(length, specialCharacters, numbers, lowerCase, upperCase);
                    e.sender.send(ChannelUtils.PASSWORD_GENERATE_RESPONSE, {password: generatedPassword});
                });
                // Add password item to database
                ipcMain.on(ChannelUtils.PASSWORD_ADD_CALL, async (e, title, description, url, username, password) => {
                    const addSuccess = await this.controller.addPassword(title, description, url, username, password);
                    e.sender.send(ChannelUtils.PASSWORD_ADD_RESPONSE, {addSuccess: addSuccess});
                });
                // Update password item in database
                ipcMain.on(ChannelUtils.PASSWORD_UPDATE_CALL, async (e, id, title, description, url, username, password) => {
                    const updateSuccess = await this.controller.updatePassword(id, title, description, url, username, password);
                    e.sender.send(ChannelUtils.PASSWORD_UPDATE_RESPONSE, {updateSuccess: updateSuccess});
                });
                // Delete password item from database
                ipcMain.on(ChannelUtils.PASSWORD_DELETE_CALL, async (e, id) => {
                    const deleteSuccess = await this.controller.deletePassword(id);
                    e.sender.send(ChannelUtils.PASSWORD_DELETE_RESPONSE, {deleteSuccess: deleteSuccess});
                });
                // Get all passwords items from database
                ipcMain.on(ChannelUtils.PASSWORD_FETCH_CALL, async (e) => {
                    const fetchedPasswords = await this.controller.fetchPasswords();
                    e.sender.send(ChannelUtils.PASSWORD_FETCH_RESPONSE, {response: fetchedPasswords});
                });
                // Get default logout and clipboard timeouts
                ipcMain.on(ChannelUtils.SECURITY_CALL, (e) => {
                    const timeouts = this.controller.getStoredSecurity();
                    e.sender.send(ChannelUtils.SECURITY_RESPONSE, {response: timeouts});
                });
                // Logout and clear users data
                ipcMain.on(ChannelUtils.LOGOUT_CALL, () => {
                    this.controller.logoutImmediate();
                });
                // ********* END shared messages with extension ********* //
                //
                // ********* Custom for electron app ********* //
                // Local Login
                ipcMain.on(ChannelUtils.LOCAL_LOGIN_CALL, async (e, password, location) => {
                    const localLoginSuccess = await this.controller.localLogin(password, location);
                    e.sender.send(ChannelUtils.LOCAL_LOGIN_RESPONSE, {localLoginSuccess: localLoginSuccess});
                });
                // Local Registration
                ipcMain.on(ChannelUtils.LOCAL_REGISTRATION_CALL, async (e, password, location) => {
                    const localRegistrationSuccess = await this.controller.localRegistration(password, location);
                    e.sender.send(ChannelUtils.LOCAL_REGISTRATION_RESPONSE, {localRegistrationSuccess: localRegistrationSuccess});
                });
                // Remote Login
                ipcMain.on(ChannelUtils.REMOTE_LOGIN_CALL, async (e, server, email, password, saveEmail) => {
                    const remoteLoginSuccess = await this.controller.remoteLogin(server, email, password, saveEmail);
                    e.sender.send(ChannelUtils.REMOTE_LOGIN_RESPONSE, {remoteLoginSuccess: remoteLoginSuccess});
                });
                // Remote Registration
                ipcMain.on(ChannelUtils.REMOTE_REGISTRATION_CALL, async (e, server, email, password, confirmationPassword, firstName, lastName) => {
                    const remoteRegistrationSuccess = await this.controller.remoteRegistration(server, email, password, confirmationPassword, firstName, lastName);
                    e.sender.send(ChannelUtils.REMOTE_REGISTRATION_RESPONSE, {remoteRegistrationSuccess: remoteRegistrationSuccess});
                });
                // Get stored (previously used) email
                ipcMain.on(ChannelUtils.EMAIL_CALL, async (e) => {
                    const email = await this.controller.getStoredEmail();
                    e.sender.send(ChannelUtils.EMAIL_RESPONSE, {email: email});
                });
                // Get stored (previously used) database location
                ipcMain.on(ChannelUtils.DB_CALL, async (e) => {
                    const database = await this.controller.getStoredDatabaseLocation();
                    e.sender.send(ChannelUtils.DB_RESPONSE, {database: database});
                });
                // Get stored (previously used) server
                ipcMain.on(ChannelUtils.SERVER_CALL, async (e) => {
                    const storedServer = await this.controller.getStoredServer();
                    e.sender.send(ChannelUtils.SERVER_RESPONSE, {server: storedServer});
                });
                // Check if custom server is valid and alive
                ipcMain.on(ChannelUtils.SERVER_AVAILABILITY_CALL, async (e, server) => {
                    const serverCheck = await this.controller.isServerValid(server);
                    e.sender.send(ChannelUtils.SERVER_AVAILABILITY_RESPONSE, {serverCheck: serverCheck});
                });
                // Set default logout and clipboard timeouts
                ipcMain.on(ChannelUtils.DEFAULT_SECURITY_CALL, (e, timeouts) => {
                    const response = this.controller.setDefaultSecurity(timeouts);
                    e.sender.send(ChannelUtils.DEFAULT_SECURITY_RESPONSE, {response: response});
                });
                // Export all password items
                ipcMain.on(ChannelUtils.EXPORT_CALL, async (e, password, email, location) => {
                    const success = await this.controller.exportPasswords(password, email, location);
                    e.sender.send(ChannelUtils.EXPORT_RESPONSE, {response: success});
                });
                // Get login mode (local | remote)
                ipcMain.on(ChannelUtils.MODE_CALL, async (e,) => {
                    const mode = await this.controller.getLoginMode();
                    e.sender.send(ChannelUtils.MODE_RESPONSE, {response: mode});
                });
                // Open browser with provided url
                ipcMain.on(ChannelUtils.BROWSER_CALL, (e, url) => {
                    shell.openExternal(url).then(() => {
                        e.sender.send(ChannelUtils.BROWSER_RESPONSE);
                    })
                })
                // Open dialog with file selector
                ipcMain.on(ChannelUtils.FILE_DIALOG_CALL, async (e) => {
                    const selectedFile = await this.controller.selectDatabase(PMUtils.DB);
                    e.sender.send(ChannelUtils.FILE_DIALOG_RESPONSE, {selectedFile: selectedFile});
                })
                // Open dialog with folder selector
                ipcMain.on(ChannelUtils.FOLDER_DIALOG_CALL, async (e) => {
                    const selectedFolder = await this.controller.selectFolder();
                    e.sender.send(ChannelUtils.FOLDER_DIALOG_RESPONSE, {selectedFolder: selectedFolder});
                })
                // ********* END Custom for electron app ********* //
                // ********* END ipcMain messaging ********* //
            } catch (e) {
                reject(e);
            }
        });
    }
}

// CommonJS Exports
module.exports = {ElectronController};