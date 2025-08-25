import mongoose,{Schema} from 'mongoose';

const requestSchema = Schema({
    problem : {

    },
    status : {
        type : String,
        enum : ['Pending','Approved','Rejected'],
        default : 'Approved'
    }
})

const Request = new mongoose.model('Request',requestSchema);

export default Request;

/*

Author Create a problem 

save the request in request schema 









*/