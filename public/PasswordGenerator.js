class PasswordGenerator {
    static generatePassword(length, specialCharacters, numbers, lowerCase, upperCase) {
        const SPECIAL_CHARACTERS = specialCharacters ? "!\"#$%'()*+,-./:;<=>?@[\\]^_`{|}~" : []
        const NUMBERS = numbers ? "123456789" : []
        const LOWER_CASE = lowerCase ? "abcdefghijklmnopqrstuvwxyz" : []
        const UPPER_CASE = upperCase ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ" : []
        const ALL_CHARACTERS = (SPECIAL_CHARACTERS + NUMBERS + LOWER_CASE + UPPER_CASE).split('')
        let generatedPassword = ""
        for (let i = 0; i < length; i++) {
            let val = ALL_CHARACTERS[(Math.random() * ALL_CHARACTERS.length) | 0]
            generatedPassword = generatedPassword.concat(val.toString())
        }
        return generatedPassword
    }
}

module.exports = {PasswordGenerator};