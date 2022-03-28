process.once('loaded', () => {
    const electron = require('electron')
    const {contextBridge, ipcRenderer} = electron;

    contextBridge.exposeInMainWorld('electron', {
        on(eventName, callback) {
            ipcRenderer.on(eventName, callback)
        },

        async invoke(eventName, ...params) {
            return await ipcRenderer.invoke(eventName, ...params)
        },


        async localLogin(password, location) {
            return new Promise((resolve) => {
                ipcRenderer.once('localLogin:response', (_, response) => {
                    resolve(response);
                });
                ipcRenderer.send('localLogin:login', password, location);
            });
        },

        async waitForLogout() {
            return new Promise((resolve) => {
                ipcRenderer.on('menu:logout', (_, response) => {
                    resolve(response);
                });
            });
        },

        async getMode() {
            return new Promise((resolve) => {
                ipcRenderer.once('mode:response', (_, response) => {
                    resolve(response);
                });
                ipcRenderer.send('mode:get');
            });
        },

        async waitForNewItem() {
            return new Promise((resolve) => {
                ipcRenderer.on('menu:newItem', (_, response) => {
                    resolve(response);
                });
            });
        },

        async waitForSaveItem() {
            return new Promise((resolve) => {
                ipcRenderer.on('menu:saveItem', (_, response) => {
                    resolve(response);
                });
            });
        },

        async waitForDeleteItem() {
            return new Promise((resolve) => {
                ipcRenderer.on('menu:deleteItem', (_, response) => {
                    resolve(response);
                });
            });
        },

        async waitForExportItems() {
            return new Promise((resolve) => {
                ipcRenderer.on('menu:exportItems', (_, response) => {
                    resolve(response);
                });
            });
        },

        async waitForAccount() {
            return new Promise((resolve) => {
                ipcRenderer.on('menu:account', (_, response) => {
                    resolve(response);
                });
            });
        },


        logoutImmediate() {
            ipcRenderer.send('logout:set')
        },

        async selectFile() {
            return new Promise((resolve) => {
                ipcRenderer.once('selectDatabase:response', (_, response) => {
                    resolve(response);
                });
                ipcRenderer.send('selectDatabase:get')
            });
        },

        async selectFolder() {
            return new Promise((resolve) => {
                ipcRenderer.once('selectFolder:response', (_, response) => {
                    resolve(response);
                });
                ipcRenderer.send('selectFolder:get')
            });
        },

        async getDefaultSecurity() {
            return new Promise((resolve) => {
                ipcRenderer.once('security:response', (_, response) => {
                    resolve(response);
                });
                ipcRenderer.send('security:get')
            });
        },
        async setDefaultSecurity(timeouts) {
            return new Promise((resolve) => {
                ipcRenderer.once('security:setResponse', (_, response) => {
                    resolve(response);
                });
                ipcRenderer.send('security:set', timeouts)
            });
        },

        async localRegistration(password, location) {
            return new Promise((resolve) => {
                ipcRenderer.once('localLogin:registerResponse', (_, response) => {
                    resolve(response);
                });
                ipcRenderer.send('localLogin:register', password, location);
            });
        },


        async exportItems(password, email, location) {
            return new Promise((resolve) => {
                ipcRenderer.once('export:response', (_, response) => {
                    resolve(response);
                });
                ipcRenderer.send('export:items', password, email, location);
            });
        },

        async dbExists() {
            return new Promise((resolve) => {
                ipcRenderer.once('db:response', (_, response) => {
                    resolve(response);
                });
                ipcRenderer.send('db:exists');
            });
        },

        async generatePassword(length, specialCharacters, numbers, lowerCase, upperCase) {
            return new Promise((resolve) => {
                ipcRenderer.once('password:generateResponse', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('password:generate', length, specialCharacters, numbers, lowerCase, upperCase);
            });
        },

        async addPassword(title, description, url, username, password) {
            return new Promise((resolve) => {
                ipcRenderer.once('passwords:addResponse', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('passwords:add', title, description, url, username, password);
            });
        },

        async updatePassword(id, title, description, url, username, password) {
            return new Promise((resolve) => {
                ipcRenderer.once('passwords:updateResponse', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('passwords:update', id, title, description, url, username, password);
            });
        },

        async deletePassword(id) {
            return new Promise((resolve) => {
                ipcRenderer.once('passwords:deleteResponse', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('passwords:delete', id);
            });
        },

        async decryptPassword(password) {
            return new Promise((resolve) => {
                ipcRenderer.once('password:decryptResponse', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('password:decrypt', password);
            });
        },

        async fetchAllPPasswords() {
            return new Promise((resolve) => {
                ipcRenderer.once('passwords:fetchResponse', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('passwords:fetch');
            });
        },

        async submitLogin(userServer, userEmail, userPassword, saveEmail) {
            return new Promise((resolve) => {
                ipcRenderer.once('remoteLogin:response', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('remoteLogin:login', userServer, userEmail, userPassword, saveEmail);
            });
        },

        async submitRegistration(userServer, userEmail, userPassword, userConfirmPassword, userFirstName, userLastName) {
            return new Promise((resolve) => {
                ipcRenderer.once('remoteRegistration:response', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('remoteRegistration:register', userServer, userEmail, userPassword, userConfirmPassword, userFirstName, userLastName);
            });
        },

        async checkServerAvailability(server) {
            return new Promise((resolve) => {
                ipcRenderer.once('server:response', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('server:check', server);
            });
        },

        async getEmail() {
            return await new Promise((resolve) => {
                ipcRenderer.once('email:response', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('email:get');
            });
        },

        async getServer() {
            return await new Promise((resolve) => {
                ipcRenderer.once('server:getResponse', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('server:get');
            });
        },


        async getDefaultView() {
            return new Promise((resolve) => {
                ipcRenderer.once('defaultView:response', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('defaultView:get');
            });
        },

        async shellOpenExternal(url) {
            return new Promise((resolve) => {
                ipcRenderer.once('browser:response', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('browser:open', url);
            });
        },
    })
})