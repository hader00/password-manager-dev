const {app, Menu, BrowserWindow, shell} = require("electron");
const {DBModeEnum} = require("../src/Utils/PMUtils");
const ChannelUtils = require("../src/Utils/ChannelUtils");
const windowStateKeeper = require("electron-window-state");
const isDev = require("electron-is-dev");
const path = require("path");
const PMUtils = require("../src/Utils/PMUtils");

/**
 * ElectronController object that creates, renders and handles Electron
 * application window with menu from template.
 *
 * @param  controller  a class providing application functionality
 */
class ElectronWindowBuilder {
    win;

    constructor(controller) {
        this.controller = controller;
        this.init().then(r => {
            return r
        });
        return this.win;
    }

    init() {
        return new Promise((resolve, reject) => {
            // Fix for white page issue on linux
            if (process.platform === 'linux') {
                app.commandLine.appendSwitch('disable-gpu');
            }
            // This method will be called when Electron has finished
            // initialization and is ready to create browser windows.
            // Some APIs can only be used after this event occurs.
            app.on('ready', async () => {
                await this.createWindow();
                const template = [
                    {
                        label: 'Items',
                        submenu: [
                            {
                                id: 'item-new-password',
                                label: 'New Password',
                                enabled: false,
                                accelerator: 'CmdOrCtrl+N',
                                click: () => {
                                    // Menu: Open new password item view
                                    this.win.webContents.send(ChannelUtils.MENU_NEW_CALL, true)
                                },
                            },
                            {
                                id: 'item-save-password',
                                label: 'Save Password',
                                enabled: false,
                                accelerator: 'CmdOrCtrl+S',
                                click: () => {
                                    // Menu: Trigger save password item action
                                    this.win.webContents.send(ChannelUtils.MENU_SAVE_CALL, true)
                                },
                            },
                            {
                                id: 'item-delete-password',
                                label: 'Delete Password',
                                enabled: false,
                                accelerator: 'CmdOrCtrl+Backspace',
                                click: () => {
                                    // Menu: Trigger delete password item action
                                    this.win.webContents.send(ChannelUtils.MENU_DELETE_CALL, true)
                                },
                            },
                            {type: 'separator'},
                            {
                                id: 'item-export-password',
                                label: 'Export Passwords',
                                enabled: false,
                                click: () => {
                                    // Menu: Open export password items view
                                    this.win.webContents.send(ChannelUtils.MENU_EXPORT_CALL, true)
                                },
                            },
                            {
                                id: 'item-import-password',
                                label: 'Import Passwords',
                                enabled: false,
                                click: async () => {
                                    // Menu: Open export password items view
                                    await this.controller.importPasswords()
                                    this.win.webContents.send(ChannelUtils.MENU_IMPORT_CALL, true)
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
                                id: 'user-account',
                                label: 'Account settings',
                                enabled: false,
                                click: () => {
                                    // Menu: Open account view
                                    this.win.webContents.send(ChannelUtils.MENU_ACCOUNT_CALL, true)
                                },
                            },
                            {
                                id: 'user-clear',
                                label: 'Clear app data',
                                click: () => {
                                    this.clearAppData()
                                },
                            },
                            {type: 'separator'},
                            {
                                id: 'user-logout',
                                label: 'Logout',
                                enabled: false,
                                click: () => {
                                    // Menu: Trigger logout action
                                    this.win.webContents.send(ChannelUtils.MENU_LOGOUT_CALL, true)
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
                                    // Menu: Open GitHub repository
                                    shell.openExternal(PMUtils.GIT_REPO)
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
                const menu = Menu.buildFromTemplate(template);
                // Set as main app menu
                Menu.setApplicationMenu(menu);
                resolve();
            });
            // Quit when the window is closed
            app.on('window-all-closed', async () => {
                // todo encrypt database after app close or after certain time, call from sm else
                if (this.controller.getLoginMode() === DBModeEnum.local) {
                    this.controller.databaseConnector.closeDatabase();
                }
                this.controller.terminateWebsocket();
                // logout user if window is closed
                this.controller.logoutImmediate();
                if (this.win?.webContents !== null) {
                    const ses = this.win?.webContents?.session;
                    if (ses !== null && ses !== undefined) {
                        await ses.clearCache();
                    }
                }
                app.quit();
            })
            // Regenerate window
            app.on('activate', async () => {
                if (BrowserWindow.getAllWindows().length === 0) {
                    await this.createWindow();
                } else {
                    this.win.show();
                }
            })
        });
    }

    // Clear application data stored in Electron Store
    async clearAppData() {
        // Get saved application
        this.controller.clearElectronStoreData()
        // Clear session cache
        const ses = this.win.webContents?.session;
        if (ses !== null) {
            await ses.clearCache();
        }
        // Relaunch Electron
        app.relaunch();
        app.exit();
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
        //pass win to Controller
        this.controller.setWin(this.win);
        // Load the index.html, or an url in dev mode
        await this.win.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../../build/index.html')}`);
        //
        this.win.on('closed', () => this.win = null);
        // Open the DevTools.
        if (isDev) {
            this.win.webContents.openDevTools()
        }
    }
}

// CommonJS Exports
module.exports = {ElectronWindowBuilder};