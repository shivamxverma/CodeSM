import mongoose,{Schema} from "mongoose";

const submissionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    problem: {
        type: Schema.Types.ObjectId,
        ref: 'Problem',
        required: true
    },
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        enum: ['cpp', 'java', 'python', 'javascript', 'c', 'csharp'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }
},{timestamps: true});

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;
