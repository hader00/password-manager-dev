const {app, BrowserWindow, Menu, ipcMain, shell} = require('electron')
const windowStateKeeper = require('electron-window-state')
const path = require('path');
const isDev = require('electron-is-dev');
const {DBModeEnum} = require("./Util");

if (process.platform === 'linux') {
    app.commandLine.appendSwitch('disable-gpu');
}

class ElectronController {
    win;

    constructor(controller) {
        this.controller = controller;
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
                    // Menu template
                    const template = [
                        {
                            label: 'Items',
                            submenu: [
                                {
                                    label: 'New Password',
                                    accelerator: 'CmdOrCtrl+N',
                                    click: () => {
                                        this.win.webContents.send("menu:newItem", true)
                                    },
                                },
                                {
                                    label: 'Save Password',
                                    accelerator: 'CmdOrCtrl+S',
                                    click: () => {
                                        this.win.webContents.send("menu:saveItem", true)
                                    },
                                },
                                {
                                    label: 'Delete Password',
                                    accelerator: 'CmdOrCtrl+Backspace',
                                    click: () => {
                                        this.win.webContents.send("menu:deleteItem", true)
                                    },
                                },
                                {type: 'separator'},
                                {
                                    label: 'Export Passwords',
                                    click: () => {
                                        this.win.webContents.send("menu:exportItems", true)
                                    },
                                },
                            ]
                        },
                        {
                            role: 'editMenu'
                        },
                        {
                            role: 'windowMenu'
                        },
                        {
                            label: 'User',
                            submenu: [
                                {
                                    label: 'Account settings',
                                    click: () => {
                                        this.win.webContents.send("menu:account", true)
                                    },
                                },
                                {type: 'separator'},
                                {
                                    label: 'Logout',
                                    click: () => {
                                        this.win.webContents.send("menu:logout", true)
                                    },
                                },
                            ]
                        },
                        {
                            role: 'help',
                            submenu: [
                                {
                                    label: 'Learn more',
                                    click: () => {
                                        shell.openExternal('https://github.com/hader00/password-manager-dev')
                                    }
                                }
                            ]
                        }
                    ]
                    // Set Mac-specific first menu item
                    if (process.platform === 'darwin') {
                        template.unshift({
                            label: app.getName(),
                            submenu: [
                                {role: 'about'},
                                {type: 'separator'},
                                {role: 'services'},
                                {type: 'separator'},
                                {role: 'hide'},
                                {role: 'hideothers'},
                                {role: 'unhide'},
                                {type: 'separator'},
                                {role: 'quit'}
                            ]
                        })
                    }
                    // Build menu
                    const menu = Menu.buildFromTemplate(template)
                    // Set as main app menu
                    Menu.setApplicationMenu(menu)

                    resolve();
                });
                // Quit when all windows are closed, except on macOS. There, it's common
                // for applications and their menu bar to stay active until the user quits
                // explicitly with Cmd + Q.
                app.on('window-all-closed', () => {
                    // todo encrypt database after app close or after certain time, call from sm else
                    if (this.controller.getLoginMode() === DBModeEnum.local) {
                        this.controller.getDatabaseConnector().closeDatabase();
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
                    e.sender.send('defaultView:response', {defaultView: defaultView});
                });
                ipcMain.on('email:get', async (e) => {
                    const email = await this.controller.getEmail()
                    e.sender.send('email:response', {email: email});
                });
                ipcMain.on('database:get', async (e) => {
                    const database = await this.controller.getDatabase()
                    e.sender.send('database:response', {database: database});
                });
                ipcMain.on('server:check', async (e, server) => {
                    const serverCheck = await this.controller.isServerValid(server)
                    e.sender.send('server:response', {serverCheck: serverCheck});
                });
                ipcMain.on('server:get', async (e) => {
                    const storedServer = await this.controller.getStoredServer()
                    e.sender.send('server:getResponse', {server: storedServer});
                });
                // decrypt
                ipcMain.on('password:decrypt', async (e, password) => {
                    const decryptedPassword = await this.controller.decryptPassword(password)
                    e.sender.send('password:decryptResponse', {password: decryptedPassword});
                });
                // Generate password
                ipcMain.on('password:generate', async (e, length, specialCharacters, numbers, lowerCase, upperCase) => {
                    const generatedPassword = await this.controller.generatePassword(length, specialCharacters, numbers, lowerCase, upperCase)
                    e.sender.send('password:generateResponse', {password: generatedPassword});
                });
                // Custom database selection
                ipcMain.on('selectDatabase:get', async (e) => {
                    const selectedFile = await this.controller.selectDatabase()
                    e.sender.send('selectDatabase:response', {selectedFile: selectedFile});
                })
                // Custom database folder selection (DB create)
                ipcMain.on('selectFolder:get', async (e) => {
                    const selectedFolder = await this.controller.selectFolder();
                    e.sender.send('selectFolder:response', {selectedFolder: selectedFolder});
                })
                // Local Login
                ipcMain.on('localLogin:login', async (e, password, location) => {
                    const localLoginSuccess = await this.controller.localLogin(password, location);
                    e.sender.send('localLogin:response', {localLoginSuccess: localLoginSuccess});
                });
                // Local Registration
                ipcMain.on('localLogin:register', async (e, password, location) => {
                    const localRegistrationSuccess = await this.controller.localRegistration(password, location)
                    e.sender.send('localLogin:registerResponse', {localRegistrationSuccess: localRegistrationSuccess});
                });
                // Remote Login
                ipcMain.on('remoteLogin:login', (e, server, email, password, saveEmail) => {
                    this.controller.remoteLogin(server, email, password, saveEmail).then(remoteLoginSuccess => {
                        e.sender.send('remoteLogin:response', {remoteLoginSuccess: remoteLoginSuccess});
                    })

                });
                // Remote Registration
                ipcMain.on('remoteRegistration:register', async (e, server, email, password, confirmationPassword, firstName, lastName) => {
                    const remoteRegistrationSuccess = await this.controller.remoteRegistration(server, email, password, confirmationPassword, firstName, lastName)
                    e.sender.send('remoteRegistration:response', {remoteRegistrationSuccess: remoteRegistrationSuccess});
                });
                // Password Add
                ipcMain.on('passwords:add', async (e, title, description, url, username, password) => {
                    const addSuccess = await this.controller.addPassword(title, description, url, username, password);
                    e.sender.send('passwords:addResponse', {addSuccess: addSuccess});
                });
                // Password Update
                ipcMain.on('passwords:update', async (e, id, title, description, url, username, password) => {
                    const updateSuccess = await this.controller.updatePassword(id, title, description, url, username, password);
                    e.sender.send('passwords:updateResponse', {updateSuccess: updateSuccess});
                });
                // Password Delete
                ipcMain.on('passwords:delete', async (e, id) => {
                    const deleteSuccess = await this.controller.deletePassword(id);
                    e.sender.send('passwords:deleteResponse', {deleteSuccess: deleteSuccess});
                });
                // Passwords fetch
                ipcMain.on('passwords:fetch', (e) => {
                    this.controller.fetchPasswords().then(fetchedPasswords => {
                        e.sender.send('passwords:fetchResponse', {response: fetchedPasswords});
                    });
                });
                // Export Items
                ipcMain.on('export:items', async (e, password, email, location) => {
                    const success = await this.controller.exportPasswords(password, email, location);
                    e.sender.send('export:response', {response: success});
                });
                // Export Items
                ipcMain.on('mode:get', async (e,) => {
                    const mode = await this.controller.getLoginMode();
                    e.sender.send('mode:response', {response: mode});
                });
                // Check if db exists
                ipcMain.on('db:exists', (e) => {
                    const dbExists = this.controller.dbExists();
                    e.sender.send('db:response', {dbExists: dbExists});
                });
                // Check default logout and clipboard timeouts
                ipcMain.on('security:get', (e) => {
                    const timeouts = this.controller.getDefaultSecurity();
                    e.sender.send('security:response', {response: timeouts});
                });
                // Set default logout and clipboard timeouts
                ipcMain.on('security:set', (e, timeouts) => {
                    const response = this.controller.setDefaultSecurity(timeouts);
                    e.sender.send('security:setResponse', {response: response});
                });
                // Set default logout and clipboard timeouts
                ipcMain.on('logout:set', (e) => {
                    this.controller.logoutImmediate();
                });
                // Open browser
                ipcMain.on("browser:open", (e, url) => {
                    shell.openExternal(url).then((r) => {
                        e.sender.send('browser:response');
                    })
                })
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
                enableRemoteModule: false,
                contextIsolation: true,
                backgroundThrottling: false,
                devTools: isDev,
                sandbox: true,
                webSecurity: true,
                allowRunningInsecureContent: false,
                preload: path.join(__dirname, "./preload.js")
            }
        })
        // Load the index.html from a url in dev mode
        await this.win.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
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