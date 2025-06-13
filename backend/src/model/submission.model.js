import mongoose,{Schema} from "mongoose";
import Problem from './problem.model.js';
import { runCppCodeWithInput } from "../utils/runCode.js";
import { ApiError } from "../utils/ApiError.js";

const submissionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        // required: true
    },
    problem: {
        type: Schema.Types.ObjectId,
        ref: 'Problem',
        // required: true
    },
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        enum: ['cpp', 'java', 'python', 'javascript', 'c', 'csharp'],
        // required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }
},{timestamps: true});

// submissionSchema.methods.codeRun = async function(problemId){

//     const problem = await Problem.findById(problemId);

//     if(!problem){
//         throw new ApiError('Problem not found');
//     }
    
//     try {
//         const output = await runCppCodeWithInput(this.code, sampleInput);
//         this.status = 'accepted';
//         return output;
//     } catch (error) {
//         this.status = 'rejected';
//         throw error;
//     }
// }

// submissionSchema.methods.codeSubmit = async function(problemId, userId, language) {
//     const problem = await Problem.findById(problemId);

//     if (!problem) {
//         throw new ApiError('Problem not found');
//     }

//     const testcases = problem.testcases;
//     if (!testcases || testcases.length === 0) {
//         throw new ApiError('No testcases available for this problem');
//     }

//     try {
//         const output = await runCppCodeWithInput(this.code, testcases);
//         this.status = 'accepted';
//         return output;
//     } catch (error) {
//         this.status = 'rejected';
//         throw error;
//     }
// }

// submissionSchema.methods.codeRun = async function(problemId){
//     const problem = await Problem.findById(problemId);

//     if(!problem){
//         throw new ApiError('Problem not found');
//     }
    
//     try {
//         const output = await runCppCodeWithInput(this.code, problem.sampleInput);
//         this.status = 'accepted';
//         return output;
//     } catch (error) {
//         this.status = 'rejected';
//         throw error;
//     }
// }

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;
