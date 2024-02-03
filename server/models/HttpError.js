class HttpError extends Error {
    constructor(errorCode, message) {
        super(message);
        this.code = errorCode;
    }
}

module.exports = HttpError;