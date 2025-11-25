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
    reactions: [{
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        type: { type: String, enum: ['like', 'dislike'] }
    }],
    status: {
        type: String,
        enum: ['active', 'flagged', 'deleted'],
        default: 'active'
    }


    // like : {
    //     type : Number,
    //     default : 0
    // },
    // dislike : {
    //     type : Number,
    //     default : 0
    // }

},{timestamps: true});

const Discussion = mongoose.model('Discussion', discussionSchema);

export default Discussion;