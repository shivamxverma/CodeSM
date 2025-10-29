class ApiError extends Error {
  public statusCode: number;
  public success: boolean;
  public data: any;
  public isOperational: boolean;

  constructor(statusCode: number,message: string,data?: any) {
    super(message);

    this.statusCode = statusCode;
    this.success = `${statusCode}`.startsWith('4') ? false : true;
    this.isOperational = true;
    this.data = data;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
