const mysql = require('mysql');
const sqlite3 = require('sqlite3');
const fs = require('fs');
const {DatabaseCrypto} = require("./DatabaseCrypto");
const {DBModeEnum, ENCRYPTED_EXTENSION, MYSQL_CONFIG} = require("./Util");

class DatabaseConnector {
    constructor() {
        this.mode = null;
        this.location = null;
        this.userPassword = null;
        this.database = null;
    }

    openDatabase(mode, location, userPassword) {
        this.mode = mode;
        this.location = location;
        this.userPassword = userPassword;

        if (this.mode === DBModeEnum.remote) {
            this.database = mysql.createConnection(MYSQL_CONFIG);
        } else if (this.mode === DBModeEnum.local) {
            console.log("checking if DB exists: ", fs.existsSync(this.location + ENCRYPTED_EXTENSION));
            if (fs.existsSync(this.location + ENCRYPTED_EXTENSION)) {
                DatabaseCrypto.decryptDatabase(this.location, this.location, this.userPassword)
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
        } else {
            new Error("Cannot initialize database")
        }
        return this.existsDatabase();
    }

    closeDatabase() {
        DatabaseCrypto.encryptDatabase(this.location, this.userPassword);
    }

    createDatabase(location, userPassword) {
        this.mode = DBModeEnum.local // We don't need to create DB for remote login
        this.location = location;
        this.userPassword = userPassword;


        this.database = new sqlite3.Database(location, (err) => {
            console.log("location =>", location)
            if (err) console.error('Database opening error: ', err);
        });
        // todo format
        const sql =
            `CREATE TABLE Passwords(
                Id INTEGER PRIMARY KEY,
                Title TEXT NOT NULL,
                Description TEXT,
                Url TEXT,
                Username TEXT NOT NULL,
                Password TEXT NOT NULL
            );`;
        this.database.all(sql, (err, rows) => {
            console.log(rows);
        });

        return this.existsDatabase();
    }

    async databaseRemoteLogin(email, password) {
        return await new Promise((resolve, reject) => {
            this.database.query(
                "SELECT Password, UserID from Users where (Email=?)",
                [email],
                (err, result) => {
                    if (err || result.length === 0) {
                        console.log("error => ", err);
                        console.log('remoteLogin:response', {remoteLoginSuccess: false})
                        resolve({userID: null, remoteLoginSuccess: false});
                    } else {
                        // console.log(result)
                        // [ RowDataPacket { Password: 'anEncodedPassword' } ]
                        if (result[0].Password === DatabaseCrypto.getHMAC(password)) {
                            let userID = result[0].UserID;
                            console.log('remoteLogin:response', {remoteLoginSuccess: true})
                            resolve({userID: userID, remoteLoginSuccess: true})
                        }
                    }
                });
        });
    }

    async databaseRemoteRegister(email, password, firstName, lastName) {
        return await new Promise((resolve, reject) => {
            this.database.query(
                "INSERT INTO Users (FirstName, LastName, Email, Password) VALUES (?,?,?,?)",
                [firstName, lastName, email, DatabaseCrypto.getHMAC(password)],
                (err, result) => {
                    if (err || result.length === 0) {
                        console.log("error => ", err);
                        console.log('remoteLogin:response', {remoteRegistrationSuccess: false})
                        resolve({userID: null, remoteRegistrationSuccess: false});
                    } else {
                        // console.log(result)
                        // [ RowDataPacket { Password: 'anEncodedPassword' } ]
                        let userID = result.insertId;
                        console.log('remoteLogin:response', {userID: userID, remoteRegistrationSuccess: true})
                        resolve({userID: userID, remoteRegistrationSuccess: true})
                    }
                });
        });
    }

    async databaseAddPassword(Title, Description, Url, Username, Password, userID) {
        return await new Promise((resolve, reject) => {
            this.database.query(
                "INSERT INTO Passwords (Title, Description, Url, Username, Password, UserID) VALUES (?,?,?,?,?,?)",
                [Title, Description, Url, Username, Password, userID],
                (err, result) => {
                    if (err) {
                        console.log("error => ", err);
                        console.log('addSuccess', {addSuccess: false})
                        resolve({addSuccess: false});
                    } else {
                        resolve({addSuccess: true})
                    }
                });
        });
    }

    async sendMessage(msg) {
        if (this.getMode() === DBModeEnum.local) {
            return await new Promise((resolve, reject) => {
                this.database.all(msg, (err, result) => {
                    if (err) {
                        resolve({response: false, err: err});
                    } else {
                        resolve({response: true, result: result});
                    }
                });
            });
        } else {
            return await new Promise((resolve, reject) => {
                console.log(msg[0], [...msg[1]])
                this.database.query(
                    msg[0],
                    msg[1],
                    (err, result) => {
                        if (err) {
                            resolve({response: false, err: err});
                        } else {
                            resolve({response: true, result: result})
                        }
                    });
            });
        }
    }

    async sendLocalMessage(msg) {
        return await new Promise((resolve, reject) => {
            this.database.all(msg, (err, rows) => {
                if (err) {
                    resolve({response: false, err: err});
                } else {
                    resolve({response: true, result: rows});
                }
            });
        });
    }


    existsDatabase() {
        return this.database !== null;
    }

    getMode() {
        return this.mode
    }


}
// CommonJS Exports
module.exports = { DatabaseConnector };