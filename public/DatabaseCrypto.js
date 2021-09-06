const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const {ENCRYPTED_EXTENSION, ALGORITHM} = require("./Util");
const secret = "pppppppppppppppppppppppppppppppp";

class DatabaseCrypto {
    static getHMAC(password) {
        const hmac = crypto.createHmac('sha256', secret);
        const data = hmac.update(password);
        return data.digest('hex');
    }

    static encrypt(password) {
        const iv = Buffer.from(crypto.randomBytes(16));
        const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(secret), iv);
        const encryptedPassword = Buffer.concat([
            cipher.update(password),
            cipher.final()
        ]);
        console.log("iv1 => ", iv, iv.toString("hex"), encryptedPassword.toString("hex"))
        return iv.toString("hex").concat(encryptedPassword.toString("hex"));
    };

    static decrypt(password) {
        const iv = Buffer.from(password.slice(0, 32), "hex");
        console.log("iv2 => ", iv, iv.toString("hex"), password.slice(32, password.length))
        const decipher = crypto.createDecipheriv(
            ALGORITHM, Buffer.from(secret), iv);
        const decryptedPassword = Buffer.concat([
            decipher.update(Buffer.from(password.slice(32, password.length), "hex")),
            decipher.final()
        ]);
        return decryptedPassword.toString();
    };

    static encryptDatabase(filePath, password) {
        // Input file
        const inputStream = fs.createReadStream(filePath);
        // Generate iv
        let iv = crypto.randomBytes(16);
        // Output file
        const outputStream = fs.createWriteStream(path.resolve(filePath + ENCRYPTED_EXTENSION), {encoding: "binary"});
        outputStream.write(iv.toString("hex"), "hex");
        // hash key to proper length
        const key = crypto.createHash('sha256').update(password).digest("base64").substr(0, 32);
        // Encrypt function
        const encrypt = crypto.createCipheriv(ALGORITHM, key, iv);
        // Encrypt file
        inputStream
            .pipe(encrypt)
            .pipe(outputStream);
        inputStream.on('end', () => {
            fs.unlinkSync(path.resolve(filePath));
        });

    }

    static async decryptDatabase(filePath, password) {
        return await new Promise((resolve, reject) => {
            // Input file
            const inputStream = fs.createReadStream(filePath + ENCRYPTED_EXTENSION, {start: 16});
            // Read iv
            const iv = fs.readFileSync(filePath + ENCRYPTED_EXTENSION).slice(0, 16);
            // Output file
            const outputStream = fs.createWriteStream(filePath);
            // hash key to proper length
            const key = crypto.createHash('sha256').update(password).digest("base64").substr(0, 32);
            // Decrypt function
            const decrypt = crypto.createDecipheriv(ALGORITHM, key, iv);
            // Decrypt file
            inputStream
                .pipe(decrypt)
                .pipe(outputStream);
            inputStream.on('end', () => {
                const fileType = fs.readFileSync(filePath).slice(0, 15).toString();
                if (fileType.toString() === "SQLite format 3") {
                    resolve(true);
                } else {
                    fs.unlinkSync(filePath);
                    resolve(false);
                }
            });
        });
    }
}

module.exports = {DatabaseCrypto};