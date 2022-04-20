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
        this.init();
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
                                label: 'New Password',
                                accelerator: 'CmdOrCtrl+N',
                                click: () => {
                                    // Menu: Open new password item view
                                    this.win.webContents.send(ChannelUtils.MENU_NEW_CALL, true)
                                },
                            },
                            {
                                label: 'Save Password',
                                accelerator: 'CmdOrCtrl+S',
                                click: () => {
                                    // Menu: Trigger save password item action
                                    this.win.webContents.send(ChannelUtils.MENU_SAVE_CALL, true)
                                },
                            },
                            {
                                label: 'Delete Password',
                                accelerator: 'CmdOrCtrl+Backspace',
                                click: () => {
                                    // Menu: Trigger delete password item action
                                    this.win.webContents.send(ChannelUtils.MENU_DELETE_CALL, true)
                                },
                            },
                            {type: 'separator'},
                            {
                                label: 'Export Passwords',
                                click: () => {
                                    // Menu: Open export password items view
                                    this.win.webContents.send(ChannelUtils.MENU_EXPORT_CALL, true)
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
                                    // Menu: Open account view
                                    this.win.webContents.send(ChannelUtils.MENU_ACCOUNT_CALL, true)
                                },
                            },
                            {type: 'separator'},
                            {
                                label: 'Logout',
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
            app.on('window-all-closed', () => {
                // todo encrypt database after app close or after certain time, call from sm else
                if (this.controller.getLoginMode() === DBModeEnum.local) {
                    this.controller.databaseConnector.closeDatabase();
                }
                // logout user if window is closed
                this.controller.logoutImmediate();
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
        // Load the index.html, or an url in dev mode
        await this.win.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
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