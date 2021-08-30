const Store = require('electron-store')

class ElectronStore {
    constructor() {
        const schema = {
            defaultView: {
                default: null,
            },
            userEmail: {
                type: 'string',
                format: 'email'
            },
            customDatabaseLocation: {
                default: null,
            }
        };

        this.store = new Store({schema});
    }

    get(key) {
        return this.store.get(key)
    }

    set(key, value) {
        return this.store.set(key, value)
    }

    has(key) {
        return this.store.get(key) != null;
    }

    remove(key) {
        return this.store.delete(key);
    }
}


// CommonJS Exports
module.exports = { ElectronStore };