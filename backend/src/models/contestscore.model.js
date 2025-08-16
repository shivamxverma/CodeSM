import mongoose from "mongoose";
const ContestScoreSchema = new mongoose.Schema({
    contest: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    score: { type: Number, default: 0 },
    penalties: { type: Number, default: 0 },
    problemResults: [{
        problem: { type: mongoose.Schema.Types.ObjectId, ref: "Problem" },
        solved: { type: Boolean, default: false },
        timeMs: { type: Number, default: 0 },
        wrongAttempts: { type: Number, default: 0 }
    }]
}, { timestamps: true });

export default mongoose.model("ContestScore", ContestScoreSchema);