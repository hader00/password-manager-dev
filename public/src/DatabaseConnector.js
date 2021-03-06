const sqlite3 = require('sqlite3');
const fs = require('fs');
const PMUtils = require("./Utils/PMUtils");

/**
 * DatabaseConnector class provides connector to local sqlite database
 *
 * @return object of DatabaseConnector
 */
class DatabaseConnector {
    constructor() {
        this.database = null;
    }

    async openDatabase(location) {
        if (fs.existsSync(location)) {
            this.database = new sqlite3.Database(location, (err) => {
                if (err) console.error(PMUtils.DB_OPEN_ERR, err);
            });
        }
        return this.database !== null;
    }

    async createDatabase(location) {
        this.database = new sqlite3.Database(location, (err) => {
            if (err) console.error(PMUtils.DB_OPEN_ERR, err);
        });
        if (this.database !== null) {
            const createPasswordsTable =
                `CREATE TABLE Passwords(
                id INTEGER PRIMARY KEY,
                item TEXT NOT NULL
            );`;
            await this.sendMessage(createPasswordsTable);
            const createValidationTable =
                `CREATE TABLE Validation(
                id INTEGER PRIMARY KEY,
                item TEXT NOT NULL,
                salt TEXT NOT NULL
            );`;
            await this.sendMessage(createValidationTable);
            return true;
        } else {
            return false;
        }
    }

    /*
     * Sends given SQLite statement to open database
     * @param  msg  a string representing SQLite statements
     */
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
            if (err) {
                console.log(PMUtils.BD_CLOSE_ERR, err.message);
            } else {
                console.log(PMUtils.BD_CLOSE_INFO);
            }
        });
    }

}

// CommonJS Exports
module.exports = {DatabaseConnector};
