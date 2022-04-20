const crypto = require('crypto');
const PMUtils = require("./Utils/PMUtils");

/**
 * PasswordGenerator object that generates new password of desired length
 * and symbols
 *
 * @param  length  a number of desired length
 * @param  specialCharacters  a bool if special characters should be used
 * @param  numbers  a bool if special numbers should be used
 * @param  lowerCase  a bool if special lowercase letters should be used
 * @param  upperCase  a bool if special uppercase letters should be used
 * @return  generated password with desired combination of characters
 */
class PasswordGenerator {
    static generatePassword(length, specialCharacters, numbers, lowerCase, upperCase) {
        const SPECIAL_CHARACTERS = specialCharacters ? PMUtils.SPECIAL_CHARACTERS : [];
        const NUMBERS = numbers ? PMUtils.NUMBERS : [];
        const LOWER_CASE = lowerCase ? PMUtils.LOWER_CASE : [];
        const UPPER_CASE = upperCase ? PMUtils.UPPER_CASE : [];
        const ALL_CHARACTERS = (SPECIAL_CHARACTERS + NUMBERS + LOWER_CASE + UPPER_CASE).split('');
        let generatedPassword = "";
        for (let i = 0; i < length; i++) {
            let val = ALL_CHARACTERS[crypto.randomInt(0, ALL_CHARACTERS.length)];
            generatedPassword = generatedPassword.concat(val.toString());
        }
        return generatedPassword;
    }
}

module.exports = {PasswordGenerator};