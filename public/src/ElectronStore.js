const Store = require('electron-store')

/**
 * ElectronStore class stores and provides persistent local application data
 *
 * @return object of ElectronStore
 */
class ElectronStore {
    constructor() {
        const schema = {
            defaultView: {
                default: null,
            },
            userEmail: {
                type: 'string',
                format: 'email',
            },
            storedServer: {
                type: 'string',
            },
            clearTimeout: {
                default: '10',
            },
            logoutTimeout: {
                default: '5',
            },
            customDatabaseLocation: {
                default: null,
            }
        };

        this.store = new Store({schema});
    }


    get(key) {
        return this.store.get(key);
    }

    set(key, value) {
        return this.store.set(key, value);
    }

    has(key) {
        return this.store.get(key) != null;
    }

    remove(key) {
        return this.store.delete(key);
    }
}


// CommonJS Exports
module.exports = {ElectronStore};