process.once('loaded', () => {
    const electron = require('electron');
    const { contextBridge, ipcRenderer, shell } = electron;

    contextBridge.exposeInMainWorld('electron', {
        on (eventName, callback) {
            ipcRenderer.on(eventName, callback)
        },

        async invoke (eventName, ...params) {
            return await ipcRenderer.invoke(eventName, ...params)
        },


        async  localLogin(password, location) {
            return new Promise((resolve) => {
                ipcRenderer.once('localLogin:response', (_, response) => {
                    resolve(response);
                });
                ipcRenderer.send('localLogin:login', password, location);
            });
        },

        async localRegistration(password) {
            return new Promise((resolve) => {
                ipcRenderer.once('localRegistration:response', (_, response) => {
                    resolve(response);
                });
                ipcRenderer.send('localRegistration:register', password);
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

        async loginMode() {
            return new Promise((resolve) => {
                ipcRenderer.once('loginMode:response', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('loginMode:get');
            });
        },

        async addPassword(Title, Description, Url, Username, Password) {
            return new Promise((resolve) => {
                ipcRenderer.once('passwords:addResponse', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('passwords:add', Title, Description, Url, Username, Password);
            });
        },

        async updatePassword(Id, Title, Description, Url, Username, Password) {
            return new Promise((resolve) => {
                ipcRenderer.once('passwords:updateResponse', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('passwords:update', Id, Title, Description, Url, Username, Password);
            });
        },

        async deletePassword(Id) {
            return new Promise((resolve) => {
                ipcRenderer.once('passwords:deleteResponse', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('passwords:delete', Id);
            });
        },

        async dbMessenger(message) {
            return new Promise((resolve) => {
                ipcRenderer.once('db-reply', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('db-message', message);
            });
        },

        async fetchAllPPasswords() {
            return new Promise((resolve) => {
                ipcRenderer.once('passwords:response', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('passwords:fetch');
            });
        },

        async submitLogin(userServer, userEmail, userPassword) {
            return new Promise((resolve) => {
                ipcRenderer.once('remoteLogin:response', (_, arg) => {
                    resolve(arg);
                });
                ipcRenderer.send('remoteLogin:login', userServer, userEmail, userPassword);
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
        async shellOpenExternal (url) {
            await shell.openExternal(url)
        },
    })
})