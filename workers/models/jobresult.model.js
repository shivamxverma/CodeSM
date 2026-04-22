import mongoose, { Schema } from 'mongoose';

const jobResultSchema = new Schema({
    submissionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Submission',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'executing', 'completed', 'failed', 'accepted', 'rejected', 'correct answer', 'tle', 'wrong answer', 'mle'],
        default: 'pending'
    },
    output: {
        type: String,
        required: false
    },
    executionTime: {
        type: Number,
        required: false
    },
    memoryUsage: {
        type: Number,
        required: false
    }
}, { timestamps: true });

const JobResult = mongoose.model('jobResult', jobResultSchema);
export default JobResult;