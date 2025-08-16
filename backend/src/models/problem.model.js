import mongoose, { Schema } from 'mongoose';

const problemSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    difficulty: {
        type: Number,
        required: true
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
    
    hints: {
        type: [{
            title: {
                type: String,
                required: true
            },
            content: {
                type: String,
                required: true
            }
        }],
        default: [] 
    },

    submission: [{
        type: Schema.Types.ObjectId,
        ref: 'Submission'
    }],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'Author',
        required: true
    },
    editorial: {
        type: String,
        required: false
    },
    editorialLink: {
        type: String,
        required: false
    },
    solution: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Problem = mongoose.model('Problem', problemSchema);

export default Problem;