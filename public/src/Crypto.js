const crypto = require('crypto');
const hkdf = require('js-crypto-hkdf');
const {HKDF_SHA512, SHA512, ALGORITHM} = require("./Utils/PMUtils");

/**
 * Crypto object that handles cryptography operations of the application
 */
class Crypto {
    //
    static getPBKDF2(password, salt, iterationsCount) {
        const derivedKey = crypto.pbkdf2Sync(password, salt, iterationsCount, 32, SHA512);
        return derivedKey.toString('hex')
    }

    //
    static async getHKDF(password, salt, keyLen, info) {
        let key = await hkdf.compute(password, HKDF_SHA512, keyLen, info, salt)
            .then((derivedKey) => {
                return derivedKey.key.buffer
            });
        return Buffer.from(key).toString('hex');
    }

    //
    static encrypt(data, key) {
        const iv = crypto.randomBytes(16).toString('hex');
        const cipher = crypto.createCipheriv(ALGORITHM,
            Buffer.from(key, "hex"),
            Buffer.from(iv, "hex")
        );
        const encrypted = Buffer.concat([
            cipher.update(data),
            cipher.final()
        ]);
        return {iv: iv, encryptedData: encrypted.toString('hex')}
    };

    //
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
}

module.exports = {Crypto};