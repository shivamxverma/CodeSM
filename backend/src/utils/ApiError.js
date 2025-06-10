class ApiError extends Error {
    constructor(
        statusCode,
        messge = "Something went wrong",
        stack = "",
        error = []
    ) {
        super(messge);
        this.statusCode = statusCode;
        this.stack = stack;
        this.error = error;
        this.data = null;
        this.success = false;
        this.errors = error;

        if(stack){
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export {ApiError};