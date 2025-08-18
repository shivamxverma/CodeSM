import mongoose,{Schema} from 'mongoose';

const discussionSchema = new Schema({
    title : {
        type : String,
        required : true,
        trim : true,
        index : true
    },
    content : {
        type : String,
        required : true,
        trim : true
    },
    user : {
        type : Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    tags : [{
        type : String,
        trim : true,
    }],
    comments : [{
        user : {
            type : Schema.Types.ObjectId,
            ref : 'User',
            required : true
        },
        content : {
            type : String,
            required : true,
            trim : true
        }
    }],
    like : {
        type : Number,
        default : 0
    },
    dislike : {
        type : Number,
        default : 0
    }

},{timestamps: true});

const Discussion = mongoose.model('Discussion', discussionSchema);

export default Discussion;