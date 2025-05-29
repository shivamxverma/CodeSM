import mongoose from "mongoose";
const { Schema } = mongoose;

const problemSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    statement: {
        type: String,
        required: true
    },
    constraint: {
        type: String,
        required: true
    },
    outputFormat: {
        type: String,
        required: true
    },
    constraints: {
        type: String,
        required: true
    },
    pretest: [{
        input: { type: String, required: true },
        output: { type: String, required: true }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});
const Problem = mongoose.model("Problem", problemSchema);
export default Problem;