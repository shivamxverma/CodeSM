import mongoose,{Schema} from 'mongoose';

const problemSchema = new Schema({
    title :{
        type : String,
        required : true,
        unique : true
    },
    description: {
        type: String,
        required: true
    },
    memoryLimit: {
        type: Number,
        required: true
    },
    timeLimit: {
        type: Number,
        required: true
    },
    inputFormat: {
        type: String,
        required: true
    },
    outputFormat: {
        type: String,
        required: true
    },
    sampleInput: {
        type: String,
        required: true
    },
    sampleOutput: {
        type: String,
        required: true
    },
    constraints: {
        type: String,
        required: true
    },
    tags: [{
        type: String,
        required: true
    }],
    testcases: {
        type : String,
        required : true
    },
    submission: [{
        type: Schema.Types.ObjectId,
        ref: 'Submission'
    }]
},{timestamps: true});

