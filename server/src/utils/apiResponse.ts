interface apiResponseData {
    [key : string] : any;
}

class apiResponse {
    public statusCode : number ;
    public data : apiResponseData | null;
    public message : string;
    public success : boolean;

    constructor(statusCode: number,data: apiResponseData| null = null, message: string){
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode >= 200 && statusCode < 300; 
    }
}

export default apiResponse;