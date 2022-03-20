const sqlite3 = require('sqlite3');
const fs = require('fs');
const {DatabaseCrypto} = require("./DatabaseCrypto");
const {ENCRYPTED_EXTENSION} = require("./Util");

class DatabaseConnector {
    constructor() {
        this.location = null;
        this.userPassword = null;
        this.database = null;
    }

    async openDatabase(location, userPassword) {
        this.location = location;
        this.userPassword = userPassword;

        console.log("checking if DB exists: ", fs.existsSync(this.location + ENCRYPTED_EXTENSION));
        if (fs.existsSync(this.location + ENCRYPTED_EXTENSION)) {
            await DatabaseCrypto.decryptDatabase(this.location, this.userPassword)
                .then(r => {
                    console.log("r =>", r)
                    if (r === true) {
                        console.log("result", r)
                        this.database = new sqlite3.Database(this.location, (err) => {
                                if (err) {
                                    new Error('Database opening error: ' + err.toString());
                                }
                            }
                        );
                    }
                });
        }
        return this.existsDatabase();
    }

    closeDatabase() {
        DatabaseCrypto.encryptDatabase(this.location, this.userPassword);
    }

    createDatabase(location) {
        this.location = location;
        this.database = new sqlite3.Database(location, (err) => {
            console.log("location =>", location)
            if (err) console.error('Database opening error: ', err);
        });
        // todo format
        const sql =
            `CREATE TABLE Passwords(
                id INTEGER PRIMARY KEY,
                item TEXT NOT NULL
            );`;
        this.database.all(sql, (err, rows) => {
            console.log(rows);
        });

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

    existsDatabase() {
        return this.database !== null;
    }

}

// CommonJS Exports
module.exports = {DatabaseConnector};