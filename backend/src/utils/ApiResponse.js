class ApiResponse {
    constructor(statusCode, message, data = null) {
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.success = statusCode >= 200 && statusCode < 300; 
    }
}

export {ApiResponse};