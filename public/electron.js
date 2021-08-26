const { app, BrowserWindow, ipcMain } = require('electron')
const windowStateKeeper = require('electron-window-state')
const sqlite3 = require('sqlite3');
const crypto = require('crypto');
const fs = require('fs');
const mysql = require('mysql');
const path = require('path');
const isDev = require('electron-is-dev');
const Store = require('electron-store');

const algorithm = 'aes-256-ctr';
let dbPassword = '';
let userID = null;
const DBMode = {
    local: 0,
    remote: 1
};
let dbModeStatus = DBMode.local

const db = mysql.createConnection({
    user: 'root',
    host: 'localhost',
    password: 'root',
    database: 'passwordManagerDB'
});

const LoginType = {
    notLogin: 0,
    localLogin: 1,
    remoteLogin: 2,
};
let loginType = LoginType.notLogin;
let database = null;
let win;

function createWindow () {
    // win state keeper
    let state = windowStateKeeper({
        defaultWidth: 350, defaultHeight: 700
    })
    // Create the browser window.
    win = new BrowserWindow({
        x: state.x, y: state.y,
        width: state.width, height: state.height,
        minWidth: 350, maxWidth: 350, minHeight: 300, maxHeight: 700,
        webPreferences: {
            nodeIntegration: false,
            devTools: isDev,
            webSecurity: true,
            allowRunningInsecureContent: false,
            enableRemoteModule: false,
            contextIsolation: true,
            backgroundThrottling: false,
            preload: path.join(__dirname, "./preload.js")
        }
    })

    //load the index.html from a url
    win.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, 'preload.js')}`);
    win.on('closed', () => win = null);

    // Open the DevTools.
    if (isDev) {
        win.webContents.openDevTools()
    }

    const schema = {
        foo: {
            type: 'number',
            maximum: 100,
            minimum: 1,
            default: 50
        },
        bar: {
            type: 'string',
            format: 'url'
        }
    };

    const store = new Store({schema});

    console.log(store.get('foo'));
    store.set('foo', 1);
    console.log(store.get('foo'));

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    switch(loginType) {
        case LoginType.notLogin:
            // code block
            break;
        case LoginType.localLogin:
            // encode database
            break;
        case LoginType.remoteLogin:
            // code block
            break;
        default:
        // code block
    }
    encryptDatabase();
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    } else {
        this.win.show();
    }
})


// Login
ipcMain.on('submit-login', (e, server, email, password) => {
    console.log("Login successful", server, email, password);
    e.sender.send('submit-login-response', "login-successful");
});

// Local
ipcMain.on('localLogin:login', (e, password, databaseLocation) => {
    // Todo decrypt password database first
    dbPassword = password;
    console.log(dbPassword);
    decryptDatabase(databaseLocation)
});

// Local
ipcMain.on('passwords:add', (e, Title, Description, Url, Username, Password) => {
    console.log("dbModeStatus =>", dbModeStatus)
    db.query(
        "INSERT INTO Passwords (Title, Description, Url, Username, Password, UserID) VALUES (?,?,?,?,?,?)",
        [Title, Description, Url, Username, Password, userID],
        (err, result) => {
            if (err) {
                console.log("error => ", err);
                console.log('passwords:addResponse', { addSuccess : false })
                e.sender.send('passwords:addResponse', {addSuccess: false})
            } else {
                console.log('passwords:addResponse', { addSuccess : true })
                e.sender.send('passwords:addResponse', {addSuccess: true})

            }
        });
});
ipcMain.on('passwords:update', (e, Id, Title, Description, Url, Username, Password) => {
    console.log("dbModeStatus =>", dbModeStatus)
    console.log('passwords:update', Id, Title, Description, Url, Username, Password);
    db.query(
        "UPDATE Passwords SET Title = ?, Description = ?, Url = ?, Username = ?, Password = ? WHERE userID = ? AND Id = ?",
        [Title, Description, Url, Username, Password, userID, Id],
        (err, result) => {
            if (err) {
                console.log("error => ", err);
                console.log('passwords:updateResponse', { updateSuccess : false })
                e.sender.send('passwords:updateResponse', {updateSuccess: false})
            } else {
                console.log('passwords:updateResponse', { updateSuccess : true })
                e.sender.send('passwords:updateResponse', {updateSuccess: true})

            }
        });
});
ipcMain.on('passwords:delete', (e, Id) => {
    db.query(
        "DELETE FROM Passwords WHERE Id = ? AND UserId = ?",
        [Id, userID],
        (err, result) => {
            if (err) {
                console.log("error => ", err);
                console.log('passwords:deleteResponse', { deleteSuccess : false })
                e.sender.send('passwords:deleteResponse', {deleteSuccess: false})
            } else {
                console.log('passwords:deleteResponse', { deleteSuccess : true })
                e.sender.send('passwords:deleteResponse', {deleteSuccess: true})

            }
        });
});


ipcMain.on('localRegistration:register', (e, password) => {
    // No decryption needed
    let localRegistrationSuccess = false;
    createDatabase()
    dbPassword = password;
    console.log("Local registration successful", password);
    if (database != null){
        localRegistrationSuccess = true;
    }
    e.sender.send('localRegistration:response', {localRegistrationSuccess: localRegistrationSuccess});
});

// Registration
ipcMain.on('remoteRegistration:register', (e, server, email, password, confirmationPassword, firstName, lastName) => {
    console.log("remoteRegistration:register", server, email, password, confirmationPassword, firstName, lastName);
    db.query(
        "INSERT INTO Users (FirstName, LastName, Email, Password) VALUES (?,?,?,?)",
        [firstName, lastName, email, password],
        (err, result) => {
            if (err) {
                console.log("error => ", err);
                console.log('remoteRegistration:response', { remoteRegistrationSuccess : false })
                e.sender.send('remoteRegistration:response', { remoteRegistrationSuccess : false });
            } else {
                dbModeStatus = DBMode.remote
                userID = result.insertId;
                console.log('remoteRegistration:response', { remoteRegistrationSuccess : true })
                e.sender.send('remoteRegistration:response', { remoteRegistrationSuccess : true });
            }
        });
});

// Registration
ipcMain.on('remoteLogin:login', (e, server, email, password) => {
    console.log('remoteLogin:login', e, server, email, password)
    db.query(
        "SELECT Password, UserID from Users where (Email=?)",
        [email],
        (err, result) => {
            if (err) {
                console.log("error => ", err);
                console.log('remoteLogin:response', { remoteLoginSuccess: false })
                console.log('remoteLogin:response', { remoteLoginSuccess: false })
            } else {
                // console.log(result)
                // [ RowDataPacket { Password: 'anEncodedPassword' } ]
                console.log(result)
                userID = result[0].UserID;
                console.log(result[0].UserID)
                dbModeStatus = DBMode.remote
                if (result[0].Password === password) {
                    console.log('remoteLogin:response', { remoteLoginSuccess: true })
                    e.sender.send('remoteLogin:response',  { remoteLoginSuccess: true });
                }
            }
        });
});

// Database present
ipcMain.on('loginMode:get', (e) => {
    e.sender.send('loginMode:response', {loginMode: dbModeStatus});
});


// Database present
ipcMain.on('db:exists', (e) => {
    let dbExists = false
    if (fs.existsSync(path.resolve(app.getPath('userData'),'passwords.db.out.encrypted'))) {
        dbExists = true
    }
    e.sender.send('db:response', {dbExists: dbExists});
});

// Database communication
ipcMain.on('db-message', (event, arg) => {
    database.all(arg, (err, rows) => {
        event.reply('db-reply', (err && err.message) || rows);
    });
});

// fetch all Passwords
ipcMain.on('passwords:fetch', (e) => {
    console.log('passwords:fetch')
    console.log("Fetching")
    db.query(
        "SELECT * FROM Passwords WHERE (UserID=?)",
        [userID],
        (err, result) => {
            if (err) {
                console.log("error => ", err);
                console.log('passwords:response', {response: result})
            } else {
                console.log("All passwords ")
                console.log("result => ", result)
                e.sender.send('passwords:response', {response: result});
            }
        });
});


function getDatabase(databaseLocation) {
    if (databaseLocation === undefined || databaseLocation === null || databaseLocation === "") {
        databaseLocation = path.resolve(app.getPath('userData'),'passwords.db')
    }
    return new sqlite3.Database(databaseLocation, (err) => {
        if (err) console.error('Database opening error: ', err);
    });
}

function createDatabase() {
    let databaseLocation = path.resolve(app.getPath('userData'),'passwords.db');
    database = new sqlite3.Database(databaseLocation, (err) => {
        if (err) console.error('Database opening error: ', err);
    });
    const sql =
            `CREATE TABLE Passwords(
                Id INTEGER PRIMARY KEY,
                Title TEXT NOT NULL,
                Description TEXT,
                Url TEXT,
                Username TEXT NOT NULL,
                Password TEXT NOT NULL
            );`;
    database.all(sql, (err, rows) => {
        console.log(rows);
    });
}

function encryptDatabase() {
    // Input file
    const inputStream = fs.createReadStream(path.resolve(app.getPath('userData'),'passwords.db'));
    // Generate iv
    let iv = crypto.randomBytes(16);
    // Output file
    const outputStream = fs.createWriteStream(path.resolve(app.getPath('userData'),'passwords.db.out.encrypted'), {encoding: "binary"});
    outputStream.write(iv.toString("hex"), "hex");
    // hash key to proper lengh
    const key = crypto.createHash('sha256').update(dbPassword).digest("base64").substr(0,32);
    // Encrypt function
    const encrypt = crypto.createCipheriv(algorithm, key, iv);
    // Encrypt file
    inputStream
        .pipe(encrypt)
        .pipe(outputStream);
    inputStream.on('end',() => {
        fs.unlinkSync(path.resolve(app.getPath('userData'),'passwords.db'));
    });

}

function decryptDatabase(databaseLocation) {
        // Input file
        const inputStream = fs.createReadStream(path.resolve(app.getPath('userData'),'passwords.db.out.encrypted'), {start: 16});
        // Read iv
        const iv = fs.readFileSync(path.resolve(app.getPath('userData'),'passwords.db.out.encrypted')).slice(0, 16);
        // Output file
        const outputStream = fs.createWriteStream(path.resolve(app.getPath('userData'),'passwords.db'));
        // hash key to proper lengh
        const key = crypto.createHash('sha256').update(dbPassword).digest("base64").substr(0,32);
        // Decrypt function
        const decrypt = crypto.createDecipheriv(algorithm, key, iv);
        // Decrypt file
        inputStream
            .pipe(decrypt)
            .pipe(outputStream);
    inputStream.on('end',() => {
        const fileType = fs.readFileSync(path.resolve(app.getPath('userData'),'passwords.db')).slice(0, 15).toString();
        if (fileType === "SQLite format 3") {
            database = getDatabase(databaseLocation)
            win.webContents.send('localLogin:response', {localLoginSuccess: true});
        } else {
            win.webContents.send('localLogin:response', {localLoginSuccess: false});
        }
    });
}


