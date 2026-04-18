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
        required: true
    },
    executionTime: {
        type: Number,
        required: true
    },
    memoryUsage: {
        type: Number,
        required: true
    }
}, { timestamps: true });

const JobResult = mongoose.model('jobResult', jobResultSchema);
export default JobResult;