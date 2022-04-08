const sqlite3 = require('@vscode/sqlite3');
const fs = require('fs');

class DatabaseConnector {
    constructor() {
        this.location = null;
        this.database = null;
    }

    async openDatabase(location) {
        this.location = location;

        if (fs.existsSync(this.location)) {
            this.database = new sqlite3.Database(this.location, (err) => {
                    if (err) {
                        new Error('Database opening error: ' + err.toString());
                    }
                }
            );
        }
        return this.existsDatabase();
    }

    async createDatabase(location) {
        this.location = location;
        this.database = new sqlite3.Database(location, (err) => {
            if (err) console.error('Database opening error: ', err);
        });
        const createPasswordsTable =
            `CREATE TABLE Passwords(
                id INTEGER PRIMARY KEY,
                item TEXT NOT NULL
            );`;
        await this.sendMessage(createPasswordsTable)
        const createValidationTable =
            `CREATE TABLE Validation(
                id INTEGER PRIMARY KEY,
                item TEXT NOT NULL
            );`;
        await this.sendMessage(createValidationTable)
        return this.existsDatabase();
    }

    async sendMessage(msg) {
        return await new Promise((resolve, _) => {
            this.database.all(msg, (err, result) => {
                if (err) {
                    resolve({response: false, err: err});
                } else {
                    resolve({response: true, result: result});
                }
            });
        });
    }

    closeDatabase() {
        this.database.close((err) => {
            if (err)
                console.log(err.message);
            else
                console.log('Close the database connection.')
        });
    }

    existsDatabase() {
        return this.database !== null;
    }

}

// CommonJS Exports
module.exports = {DatabaseConnector};
