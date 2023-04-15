const passRegex = new RegExp(/^[a-zA-Z0-9]*[\W_]+[a-zA-Z0-9]*$/);
const checkStringHasDigits = /\d+/

module.exports = {
    EMAILREGEX: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d._%+-]+@[A-Za-z\d.-]+\.[A-Za-z]{2,}$/,
    checkPasswordHasSpecialCharacters: (password) => {
        return passRegex.test(password)
    },
    stringHasAnyNumber: (str) => {
        return checkStringHasDigits.test(str)
    }
}
