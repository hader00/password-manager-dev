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

class Main {
    win;

    constructor() {
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
                // decrypt
                ipcMain.on('password:decrypt', (e, password) => {
                    password = DatabaseCrypto.decrypt(password)
                    e.sender.send('password:decryptResponse', {decryptionSuccess: true, password: password});
                });
                // Default View
                ipcMain.on('defaultView:get', (e) => {
                    console.log(this.electronStore.get("defaultView"))
                    e.sender.send('defaultView:response', {defaultView: this.electronStore.get("defaultView")});
                });

                // Generate password
                ipcMain.on('password:generate', (e, length, specialCharacters, numbers, lowerCase, upperCase) => {
                    console.log(length, specialCharacters, numbers, lowerCase, upperCase)
                    const password = PasswordGenerator.generatePassword(length, specialCharacters, numbers, lowerCase, upperCase)
                    console.log(password)
                    e.sender.send('password:generateResponse', {password: password});
                });
                // Custom database selection
                ipcMain.on('selectDatabase:get', async (e) => {
                    const result = await dialog.showOpenDialog(this.win, {
                        properties: ['openFile']
                    })
                    console.log('directories selected', result.filePaths)
                    let validity = false;
                    let selectedFile = "";
                    if (result.filePaths.length > 0) {
                        validity = true;
                        selectedFile = result.filePaths[0]
                    }
                    e.sender.send('selectDatabase:response', {validity: validity, selectedFile: selectedFile});
                })
                // Custom database folder selection (DB create)
                ipcMain.on('selectFolder:get', async (e) => {
                    const result = await dialog.showOpenDialog(this.win, {
                        properties: ['openDirectory']
                    })
                    console.log('folder selected', result.filePaths)
                    let validity = false;
                    let selectedFolder = "";
                    if (result.filePaths.length > 0) {
                        validity = true;
                        selectedFolder = result.filePaths[0]
                    }
                    e.sender.send('selectFolder:response', {validity: validity, selectedFolder: selectedFolder});
                })
                // Local Login
                ipcMain.on('localLogin:login', (e, password, location) => {
                    console.log(password, location)
                    if (isEmpty(location)) {
                        location = DEFAULT_LOCAL_DB_LOCATION;
                    }
                    const decryptionResult = this.databaseConnector.openDatabase(DBModeEnum.local, location, password);
                    console.log(decryptionResult)
                    if (decryptionResult && this.isFirstLogin) {
                        this.electronStore.set("defaultView", VIEW_TYPE.localLoginView)
                    }
                    e.sender.send('localLogin:response', {localLoginSuccess: decryptionResult});
                    if (decryptionResult === true) {
                        this.loginMode = DBModeEnum.local
                    }
                });
                // Local Registration
                ipcMain.on('localLogin:register', (e, password, location) => {
                    console.log(password)
                    if (isEmpty(location)) {
                        location = DEFAULT_LOCAL_DB_LOCATION;
                    } else {
                        location = path.resolve(location, DATABASE_FILENAME)
                    }
                    const localRegistrationResult = this.databaseConnector.createDatabase(location, password);
                    if (localRegistrationResult && this.isFirstLogin) {
                        this.electronStore.set("defaultView", VIEW_TYPE.localLoginView)
                        // todo: save customDatabaseLocation
                        //this.electronStore.set("customDatabaseLocation", location)
                    }
                    e.sender.send('localLogin:registerResponse', {localRegistrationSuccess: localRegistrationResult});
                    if (localRegistrationResult === true) {
                        this.loginMode = DBModeEnum.local
                    }
                });
                // Remote Login
                ipcMain.on('remoteLogin:login', (e, server, email, password) => {
                    console.log('remoteLogin:login', e, server, email, password)
                    // todo add custom server
                    if (this.databaseConnector.openDatabase(DBModeEnum.remote, "", "")) {
                        this.databaseConnector.databaseRemoteLogin(email, password).then(r => {
                            if (r.remoteLoginSuccess) {
                                this.userID = r.userID;
                            }
                            console.log("remoteLoginresult ",r)
                            e.sender.send('remoteLogin:response', {remoteLoginSuccess: r.remoteLoginSuccess});
                            if (r.remoteLoginSuccess === true) {
                                this.loginMode = DBModeEnum.remote
                            }
                    })
                }});
                // Remote Registration
                ipcMain.on('remoteRegistration:register', (e, server, email, password, confirmationPassword, firstName, lastName) => {
                    console.log('remoteRegistration:register', e, server, email, password, confirmationPassword, firstName, lastName)
                    // todo add custom server
                    // todo double check password
                    if (this.databaseConnector.openDatabase(DBModeEnum.remote, "", "")) {
                        this.databaseConnector.databaseRemoteRegister(email, password, firstName, lastName).then(r => {
                            if (r.remoteRegistrationSuccess) {
                                this.userID = r.userID;
                            }
                            console.log("remoteRegistration ",r)
                            e.sender.send('remoteRegistration:response', {remoteRegistrationSuccess: r.remoteRegistrationSuccess});
                            if (r.remoteRegistrationSuccess === true) {
                                this.loginMode = DBModeEnum.remote
                            }
                        })
                    }});
                // Password Add
                ipcMain.on('passwords:add', (e, Title, Description, Url, Username, Password) => {
                    if (this.databaseConnector.existsDatabase() && this.databaseConnector.getMode() === this.loginMode) {
                        Password = DatabaseCrypto.encrypt(Password);
                        let msg = "";
                        if (this.loginMode === DBModeEnum.local) {
                            msg = `INSERT INTO Passwords (Title, Description, Url, Username, Password)` +
                                `VALUES ('${Title}', '${Description}', '${Url}', `+
                                `'${Username}', '${Password}');`
                        } else {
                            msg = ["INSERT INTO Passwords (Title, Description, Url, Username, Password, UserID) VALUES (?,?,?,?,?,?)", [Title, Description, Url, Username, Password, this.userID]]
                        }
                        console.log("sending")
                        this.databaseConnector.sendMessage(msg)
                            .then(result => {
                                e.sender.send('passwords:addResponse', {addSuccess: result.response});
                            });
                    }
                });
                // Password Update
                ipcMain.on('passwords:update', (e, Id, Title, Description, Url, Username, Password) => {
                    console.log('passwords:update', Id, Title, Description, Url, Username, Password);
                    Password = DatabaseCrypto.encrypt(Password);
                    if (this.databaseConnector.existsDatabase() && this.databaseConnector.getMode() === this.loginMode) {
                        let msg = "";
                        if (this.loginMode === DBModeEnum.local) {
                            msg = `UPDATE Passwords ` +
                                `SET Title = '${Title}', Description = '${Description}', Url = '${Url}', `+
                                `Username = '${Username}', Password = '${Password}' `+
                                `WHERE Id = ${Id};`
                        } else {
                            msg = ["UPDATE Passwords SET Title = ?, Description = ?, Url = ?, Username = ?, Password = ? WHERE userID = ? AND Id = ?", [Title, Description, Url, Username, Password, this.userID, Id]]
                        }
                        this.databaseConnector.sendMessage(msg)
                            .then(result => {
                                e.sender.send('passwords:updateResponse', {updateSuccess: result.response});
                            });
                    }
                });
                // Password Delete
                ipcMain.on('passwords:delete', (e, Id) => {
                    if (this.databaseConnector.existsDatabase() && this.databaseConnector.getMode() === this.loginMode) {
                        let msg = "";
                        if (this.loginMode === DBModeEnum.local) {
                            msg = `DELETE FROM Passwords WHERE Id = ${Id}`;
                        } else {
                            msg = ["DELETE FROM Passwords WHERE Id = ? AND UserId = ?", [Id, this.userID]];
                        }
                        this.databaseConnector.sendMessage(msg)
                            .then(result => {
                                e.sender.send('passwords:deleteResponse', {deleteSuccess: result.response});
                            });
                    }
                });
                // Passwords fetch
                ipcMain.on('passwords:fetch', (e) => {
                    if (this.databaseConnector.existsDatabase() && this.databaseConnector.getMode() === this.loginMode) {
                        let msg = "";
                        if (this.loginMode === DBModeEnum.local) {
                            msg = "SELECT * FROM Passwords";
                        } else {
                            msg = ["SELECT * FROM Passwords WHERE (UserID=?)", [this.userID]];
                        }
                        this.databaseConnector.sendMessage(msg)
                            .then(result => {
                                console.log(result)
                                if (result.response === true) {
                                    e.sender.send('passwords:fetchResponse', {response: result.result});
                                }
                            });
                     }
                });
                // Local // todo dont send directly
                ipcMain.on('db-message', (e, arg) => {
                    if (this.databaseConnector.existsDatabase() && this.databaseConnector.getMode() === this.loginMode && this.loginMode === DBModeEnum.local) {
                        this.databaseConnector.sendLocalMessage(arg).then(result => {
                                if (result.response === true){
                                    e.reply('db-reply', result.result);
                                }
                        })
                    }
                });
                // deprecated
                ipcMain.on('loginMode:get', (e) => {
                    e.sender.send('loginMode:response', {loginMode: this.loginMode});
                });

                // Database present
                ipcMain.on('db:exists', (e) => {
                    // todo needs to be handled other way by saving previous user state (custom location etc)
                    e.sender.send('db:response', {dbExists: !this.isFirstLogin});
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
    }
}

// CommonJS Exports
module.exports = { Main };