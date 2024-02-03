// username validation same as github username conditions
const usernameRegex = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i
/* password must be between 8-128 chars, one uppercase letter, one lowercase letter
    , one digit and one special character
*/
const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,128}$/

module.exports.validateUsername = (value, helpers) => {
    if (!usernameRegex.test(value)){
        return helpers.error("string.pattern.base");
    }

    return value;
}

module.exports.validatePassword = (value, helpers) => {
    if (!passwordRegex.test(value)){
        return helpers.error("string.pattern.base");
    }

    return value;
}