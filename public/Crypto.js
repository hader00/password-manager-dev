const crypto = require('crypto');
const hkdf = require('js-crypto-hkdf');
const {SHA512, ALGORITHM} = require("./Util");

class Crypto {
    static getPBKDF2(password, salt, iterationsCount) {
        const derivedKey = crypto.pbkdf2Sync(password, salt, iterationsCount, 32, SHA512);
        return derivedKey.toString('hex')
    }

    static async getHKDF(password, salt, keyLen) {
        let key = await hkdf.compute(password, 'SHA-512', keyLen, 'encryptionKeyInfo', salt)
            .then((derivedKey) => {
                return derivedKey.key.buffer
            });
        return Buffer.from(key).toString('hex');
    }

    static encrypt(data, iv, key) {
        const cipher = crypto.createCipheriv(ALGORITHM,
            Buffer.from(key, "hex"),
            Buffer.from(iv, "hex")
        );
        const encrypted = Buffer.concat([
            cipher.update(data),
            cipher.final()
        ]);
        return {encryptedData: encrypted.toString('hex')}
    };

    static decrypt(encryptedData, iv, key) {
        const decipher = crypto.createDecipheriv(ALGORITHM,
            Buffer.from(key, "hex"),
            Buffer.from(iv, "hex")
        );
        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(encryptedData, "hex")),
            decipher.final()
        ]);
        return {decryptedData: decrypted.toString()};
    };

    static encryptPassword(password, key) {
        const iv = Buffer.from(crypto.randomBytes(16));
        const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key, "hex"), iv);
        const encryptedPassword = Buffer.concat([
            cipher.update(password),
            cipher.final()
        ]);
        return iv.toString("hex").concat(encryptedPassword.toString("hex"));
    };

    static decryptPassword(password, key) {
        const iv = Buffer.from(password.slice(0, 32), "hex");
        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(key, "hex"), iv);
        const decryptedPassword = Buffer.concat([
            decipher.update(Buffer.from(password.slice(32, password.length), "hex")),
            decipher.final()
        ]);
        return decryptedPassword.toString();
    };
}

module.exports = {Crypto};