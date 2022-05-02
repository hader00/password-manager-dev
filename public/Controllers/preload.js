/*
* Cannot import constants from ./ChannelUtils for security reasons
* Keep channel names synchronised with ./ChannelUtils when changing
*/
process.once('loaded', () => {
    const electron = require('electron');
    const {contextBridge, ipcRenderer} = electron;
    // Create communication bridge between React and Electron
    // application for increased security
    contextBridge.exposeInMainWorld('electron', {
        on(eventName, callback) {
            ipcRenderer.on(eventName, callback);
        },
        // ********* ipcRenderer and ipcMain messaging ********* //
        //
        // Note: Ensure that you have added new ipcMain.on('channel', ()=>{}) to
        // ElectronController.js when editing this file
        //
        // Get stored default view (open local login view, if local database was used previously)
        async getDefaultView() {
            return new Promise((resolve) => {
                ipcRenderer.once('defaultView:response', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('defaultView:get');
            });
        },
        // Decrypt password from currently viewed password item
        async decryptPassword(password) {
            return new Promise((resolve) => {
                ipcRenderer.once('password:decryptResponse', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('password:decrypt', password);
            });
        },
        // Generate new password with custom options
        async generatePassword(length, specialCharacters, numbers, lowerCase, upperCase) {
            return new Promise((resolve) => {
                ipcRenderer.once('password:generateResponse', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('password:generate', length, specialCharacters, numbers, lowerCase, upperCase);
            });
        },
        // Add password item to database
        async addPassword(title, description, url, username, password) {
            return new Promise((resolve) => {
                ipcRenderer.once('passwords:addResponse', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('passwords:add', title, description, url, username, password);
            });
        },
        // Update password item in database
        async updatePassword(id, title, description, url, username, password) {
            return new Promise((resolve) => {
                ipcRenderer.once('passwords:updateResponse', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('passwords:update', id, title, description, url, username, password);
            });
        },
        // Delete password item from database
        async deletePassword(id) {
            return new Promise((resolve) => {
                ipcRenderer.once('passwords:deleteResponse', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('passwords:delete', id);
            });
        },
        // Get all passwords items from database
        async fetchAllPPasswords() {
            return new Promise((resolve) => {
                ipcRenderer.once('passwords:fetchResponse', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('passwords:fetch');
            });
        },
        // Get default logout and clipboard timeouts
        async getDefaultSecurity() {
            return new Promise((resolve) => {
                ipcRenderer.once('security:response', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('security:get');
            });
        },
        // Logout and clear users data
        logoutImmediate() {
            ipcRenderer.send('logout:set');
        },
        // Local Login
        async localLogin(password, location) {
            return new Promise((resolve) => {
                ipcRenderer.once('localLogin:response', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('localLogin:login', password, location);
            });
        },
        // Local Registration
        async localRegistration(password, location) {
            return new Promise((resolve) => {
                ipcRenderer.once('localLogin:registerResponse', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('localLogin:register', password, location);
            });
        },
        // Remote Login
        async submitLogin(userServer, userEmail, userPassword, saveEmail) {
            return new Promise((resolve) => {
                ipcRenderer.once('remoteLogin:response', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('remoteLogin:login', userServer, userEmail, userPassword, saveEmail);
            });
        },
        // Remote Registration
        async submitRegistration(userServer, userEmail, userPassword, userConfirmPassword, userFirstName, userLastName) {
            return new Promise((resolve) => {
                ipcRenderer.once('remoteRegistration:response', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('remoteRegistration:register', userServer, userEmail, userPassword, userConfirmPassword, userFirstName, userLastName);
            });
        },
        // Get stored (previously used) email
        async getEmail() {
            return await new Promise((resolve) => {
                ipcRenderer.once('email:response', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('email:get');
            });
        },
        // Get stored (previously used) database location
        async getDatabase() {
            return await new Promise((resolve) => {
                ipcRenderer.once('database:response', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('database:get');
            });
        },
        // Get stored (previously used) server
        async getServer() {
            return await new Promise((resolve) => {
                ipcRenderer.once('server:getResponse', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('server:get');
            });
        },
        // Check if custom server is valid and alive
        async checkServerAvailability(server) {
            return new Promise((resolve) => {
                ipcRenderer.once('server:response', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('server:check', server);
            });
        },
        // Set default logout and clipboard timeouts
        async setDefaultSecurity(timeouts) {
            return new Promise((resolve) => {
                ipcRenderer.once('security:setResponse', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('security:set', timeouts);
            });
        },
        // Export all password items
        async exportItems(password, email, location) {
            return new Promise((resolve) => {
                ipcRenderer.once('export:response', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('export:items', password, email, location);
            });
        },
        // Get login mode (local | remote)
        async getMode() {
            return new Promise((resolve) => {
                ipcRenderer.once('mode:response', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('mode:get');
            });
        },
        // Open browser with provided url
        async shellOpenExternal(url) {
            return new Promise((resolve) => {
                ipcRenderer.once('browser:response', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('browser:open', url);
            });
        },
        // Open dialog with file selector
        async selectFile() {
            return new Promise((resolve) => {
                ipcRenderer.once('selectDatabase:response', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('selectDatabase:get');
            });
        },
        // Open dialog with folder selector
        async selectFolder() {
            return new Promise((resolve) => {
                ipcRenderer.once('selectFolder:response', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('selectFolder:get');
            });
        },
        // **** END ipcRenderer and ipcMain messaging **** //
        //
        // **** Menu listeners **** //
        // Menu: Trigger logout action
        async waitForLogout() {
            return new Promise((resolve) => {
                ipcRenderer.on('menu:logout', (_, arg) => {
                    resolve(arg);
                });
            });
        },
        // Menu: Trigger save password item action
        async waitForSaveItem() {
            return new Promise((resolve) => {
                ipcRenderer.on('menu:saveItem', (_, arg) => {
                    resolve(arg);
                });
            });
        },
        // Menu: Trigger delete password item action
        async waitForDeleteItem() {
            return new Promise((resolve) => {
                ipcRenderer.on('menu:deleteItem', (_, arg) => {
                    resolve(arg);
                });
            });
        },
        // Menu: Open new password item view
        async waitForNewItem() {
            return new Promise((resolve) => {
                ipcRenderer.on('menu:newItem', (_, arg) => {
                    resolve(arg);
                });
            });
        },
        // Menu: Open export password items view
        async waitForExportItems() {
            return new Promise((resolve) => {
                ipcRenderer.on('menu:exportItems', (_, arg) => {
                    resolve(arg);
                });
            });
        },
        // Menu: Open account view
        async waitForAccount() {
            return new Promise((resolve) => {
                ipcRenderer.on('menu:account', (_, arg) => {
                    resolve(arg);
                });
            });
        },
        // Menu: Import action
        async waitForImportMenuFromElectron() {
            return new Promise((resolve) => {
                ipcRenderer.on('menu:import', (_, arg) => {
                    resolve(arg);
                });
            });
        },
        // **** END Menu listeners **** //
    })
})