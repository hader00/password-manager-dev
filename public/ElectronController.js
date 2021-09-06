const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const windowStateKeeper = require('electron-window-state')
const path = require('path');
const isDev = require('electron-is-dev');
const {DatabaseCrypto} = require("./DatabaseCrypto");
const {DATABASE_FILENAME} = require("./Util");
const {DEFAULT_LOCAL_DB_LOCATION} = require("./Util");
const {isEmpty} = require("./Util");
const {VIEW_TYPE} = require("./Util");
const {ElectronStore} = require("./ElectronStore");
const {DatabaseConnector} = require("./DatabaseConnector");
const {DBModeEnum} = require("./Util");
const url = require('url');
const {PasswordGenerator} = require("./PasswordGenerator");

if (process.platform === 'linux') {
    app.commandLine.appendSwitch('disable-gpu');
}

class ElectronController {
    win;

    constructor(controller) {
        this.controller = controller;
        this.electronStore = new ElectronStore();
        this.databaseConnector = new DatabaseConnector();
        this.isFirstLogin = false;
        this.loginMode = null;
        this.userID = null;
        this.customDatabaseLocation = null;

        // todo move to "clear" button + delete local DB before publishing
        //this.electronStore.remove("defaultView");
        //this.electronStore.remove("customDatabaseLocation");

        if (!this.electronStore.has("defaultView")) {
            this.isFirstLogin = true;
            this.electronStore.set("defaultView", VIEW_TYPE.defaultLoginView);
        } else {
            this.customDatabaseLocation = this.electronStore.get("customDatabaseLocation");
        }

        console.log("Main is alive")
        //
        this.init();
    }

    init() {
        return new Promise((resolve, reject) => {
            try {
                // This method will be called when Electron has finished
                // initialization and is ready to create browser windows.
                // Some APIs can only be used after this event occurs.
                app.on('ready', async () => {
                    await this.createWindow();
                    resolve();
                });
                // Quit when all windows are closed, except on macOS. There, it's common
                // for applications and their menu bar to stay active until the user quits
                // explicitly with Cmd + Q.
                app.on('window-all-closed', () => {
                    // todo encrypt database after app close or after certain time, call from sm else
                    if (this.loginMode === DBModeEnum.local) {
                        this.databaseConnector.closeDatabase();
                    }
                    if (process.platform !== 'darwin') {
                        app.quit();
                    }
                })
                //
                app.on('activate', async () => {
                    // On macOS it's common to re-create a window in the app when the
                    // dock icon is clicked and there are no other windows open.
                    if (BrowserWindow.getAllWindows().length === 0) {
                        await this.createWindow();
                    } else {
                        this.win.show();
                    }
                })

                //********* ipcMain messaging ****//
                // Default View
                ipcMain.on('defaultView:get', (e) => {
                    const defaultView = this.controller.getDefaultView()
                    console.log("defaultView => ", defaultView)
                    e.sender.send('defaultView:response', {defaultView: defaultView});
                });
                // decrypt
                ipcMain.on('password:decrypt', (e, password) => {
                    const decryptedPassword = this.controller.decryptPassword(password).then(decryptedPassword => {
                        console.log("decryptedPassword => ", decryptedPassword)
                        e.sender.send('password:decryptResponse', {password: decryptedPassword});
                    })
                });
                // Generate password
                ipcMain.on('password:generate', (e, length, specialCharacters, numbers, lowerCase, upperCase) => {
                    const generatedPassword = this.controller.generatePassword(length, specialCharacters, numbers, lowerCase, upperCase)
                    console.log("generatedPassword => ", generatedPassword)
                    e.sender.send('password:generateResponse', {password: generatedPassword});
                });
                // Custom database selection
                ipcMain.on('selectDatabase:get', async (e) => {
                    const selectedFile = await this.controller.selectDatabase()
                    console.log("selected DB => ", selectedFile)
                    e.sender.send('selectDatabase:response', {selectedFile: selectedFile});
                })
                // Custom database folder selection (DB create)
                ipcMain.on('selectFolder:get', async (e) => {
                    const selectedFolder = await this.controller.selectFolder();
                    console.log("selected Folder => ", selectedFolder)
                    e.sender.send('selectFolder:response', {selectedFolder: selectedFolder});
                })
                // Local Login
                ipcMain.on('localLogin:login', (e, password, location) => {
                    const localLoginSuccess = this.controller.localLogin(password, location);
                    console.log("localLoginSuccess => ", localLoginSuccess)
                    e.sender.send('localLogin:response', {localLoginSuccess: localLoginSuccess});
                });
                // Local Registration
                ipcMain.on('localLogin:register', (e, password, location) => {
                    const localRegistrationSuccess = this.controller.localRegistration(password, location)
                    console.log("localRegistrationSuccess => ", localRegistrationSuccess)
                    e.sender.send('localLogin:registerResponse', {localRegistrationSuccess: localRegistrationSuccess});
                });
                // Remote Login
                ipcMain.on('remoteLogin:login', (e, server, email, password) => {
                    console.log('remoteLogin:login', e, server, email, password)
                    // todo add custom server
                    this.controller.remoteLogin(server, email, password).then(remoteLoginSuccess => {
                        console.log("remoteLoginSuccess => ", remoteLoginSuccess)
                        e.sender.send('remoteLogin:response', {remoteLoginSuccess: remoteLoginSuccess});
                    })

                });
                // Remote Registration
                ipcMain.on('remoteRegistration:register', (e, server, email, password, confirmationPassword, firstName, lastName) => {
                    console.log('remoteRegistration:register', e, server, email, password, confirmationPassword, firstName, lastName)
                    // todo add custom server
                    // todo double check password
                    const remoteRegistrationSuccess = this.controller.remoteRegistration(server, email, password, confirmationPassword, firstName, lastName)
                    console.log("remoteRegistrationSuccess => ", remoteRegistrationSuccess)
                    e.sender.send('remoteRegistration:response', {remoteRegistrationSuccess: remoteRegistrationSuccess});
                });
                // Password Add
                ipcMain.on('passwords:add', (e, Title, Description, Url, Username, Password) => {
                    const addSuccess = this.controller.addPassword(Title, Description, Url, Username, Password);
                    console.log("addSuccess => ", addSuccess)
                    e.sender.send('passwords:addResponse', {addSuccess: addSuccess});
                });
                // Password Update
                ipcMain.on('passwords:update', (e, Id, Title, Description, Url, Username, Password) => {
                    const updateSuccess = this.controller.updatePassword(Id, Title, Description, Url, Username, Password);
                    console.log("updateSuccess => ", updateSuccess)
                    e.sender.send('passwords:updateResponse', {updateSuccess: updateSuccess});
                });
                // Password Delete
                ipcMain.on('passwords:delete', (e, Id) => {
                    const deleteSuccess = this.controller.deletePassword(Id);
                    console.log("deleteSuccess => ", deleteSuccess)
                    e.sender.send('passwords:deleteResponse', {deleteSuccess: deleteSuccess});
                });
                // Passwords fetch
                ipcMain.on('passwords:fetch', (e) => {
                    this.controller.fetchPasswords().then(fetchedPasswords => {
                        console.log("fetchedPasswords => ", fetchedPasswords)
                        e.sender.send('passwords:fetchResponse', {response: fetchedPasswords});
                    });
                });

                // @deprecated, introduce check via electronStore
                ipcMain.on('db:exists', (e) => {
                    // todo needs to be handled other way by saving previous user state (custom location etc)
                    const dbExists = this.controller.dbExists();
                    console.log("dbExists => ", dbExists)
                    e.sender.send('db:response', {dbExists: dbExists});
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    //
    async createWindow() {
        let state = windowStateKeeper({
            defaultWidth: 350, defaultHeight: 700
        })
        // Create the browser window.
        this.win = new BrowserWindow({
            x: state.x, y: state.y,
            width: state.width, height: state.height,
            minWidth: 350, maxWidth: 350, minHeight: 300, maxHeight: 700,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                backgroundThrottling: false,
                devTools: isDev,
                sandbox: true,
                webSecurity: true,
                allowRunningInsecureContent: false,
                enableRemoteModule: false,
                preload: path.join(__dirname, "./preload.js")
            }
        })
        // Load the index.html from a url in dev mode
        await this.win.loadURL(isDev ? 'http://localhost:3000' :
            url.format({
                pathname: path.join(__dirname, 'index.html'),
                protocol: 'file:',
                slashes: true
            }));
        //`file://${path.join(__dirname, '../build/index.html')}`);
        //
        this.win.on('closed', () => this.win = null);
        // Open the DevTools.
        if (isDev) {
            this.win.webContents.openDevTools()
        }
        // Return window to controller
        this.controller.setWin(this.win);
    }
}

// CommonJS Exports
module.exports = {ElectronController};