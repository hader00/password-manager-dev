// Modules
const {app, Menu, shell} = require('electron')

// Menu template
const template = [
    {
        label: 'Items',
        submenu: [
            {
                label: 'Add New',
                click: () => {
                },
                accelerator: 'CmdOrCtrl+O'
            },
            {
                label: 'Read Item',
                accelerator: 'CmdOrCtrl+Enter',
                click: () => {
                },
            },
            {
                label: 'Delete Item',
                accelerator: 'CmdOrCtrl+Backspace',
                click: () => {
                },
            },
            {
                label: 'Open in Browser',
                accelerator: 'CmdOrCtrl+Shift+O',
                click: () => {
                },
            },
            {
                label: 'Search Items',
                accelerator: 'CmdOrCtrl+S',
                click: () => {
                },
            }
        ]
    },
    {
        role: 'editMenu'
    },
    {
        role: 'windowMenu'
    },
    {
        role: 'help',
        submenu: [
            {
                label: 'Learn more',
                click: () => {
                    shell.openExternal('https://github.com/')
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
